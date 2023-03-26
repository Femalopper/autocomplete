/* eslint consistent-return: off */

import React, { useRef, createRef, forwardRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import options from '../../data/words.json';
import filterWords from './autocomplete';

const Field = forwardRef((props, ref) => {
  const optionRefs = useRef([]);
  const fieldRefs = ref;
  const {
    selectItem,
    formState,
    setFormState,
    getNearestUnfilledField,
    setActiveField,
    activeField,
    setInputs,
    inputs,
    unfocusAllItems,
    focusedOption,
    setFocusedOption,
    coords,
    setCoords,
  } = props;

  const keyDownHandler = (event) => {
    const { target, keyCode, shiftKey } = event;
    console.log(shiftKey);
    const { name } = target;

    const hasOptions = optionRefs.current.length !== 0 && optionRefs.current[0].current;

    if ((keyCode === 38 || (shiftKey && keyCode === 9)) && hasOptions) {
      // arrow up and shift+tab
      event.preventDefault();
      const optionHeight = optionRefs.current[0].current.getBoundingClientRect().height;
      if (focusedOption === 0) {
        setFocusedOption(optionRefs.current.length - 1);
        setCoords(optionHeight * (optionRefs.current.length - 1));
      } else {
        setFocusedOption(focusedOption - 1);
        setCoords(coords - optionHeight);
      }
    } else if ((keyCode === 40 || keyCode === 9) && hasOptions) {
      // arrow down and tab
      event.preventDefault();
      const optionHeight = optionRefs.current[0].current.getBoundingClientRect().height;
      if (focusedOption === optionRefs.current.length - 1) {
        setFocusedOption(0);
        setCoords(0);
      } else {
        setFocusedOption(focusedOption + 1);
        setCoords(coords + optionHeight);
      }
    } else if (keyCode === 27) {
      // escape
      event.preventDefault();
      unfocusAllItems();
    } else if (keyCode === 13 && hasOptions) {
      // enter
      const currentOptionValue = optionRefs.current[focusedOption].current.textContent;
      selectItem(currentOptionValue, name);
    }
  };

  const pasteHandler = (event) => {
    event.preventDefault();
    setFormState('updated');
    const { target } = event;
    const { name } = target;
    let currentName = +name - 1;
    navigator.clipboard.readText().then((clipText) => {
      const copiedValues = clipText.split(/[\s,]+/); // convert string to array, separating words with commas or any spaces;
      if (copiedValues[0].trim() === '') return;
      const diff = fieldRefs.current.length - name;
      const fillRest = copiedValues.slice(0, diff + 1).reduce((acc, copiedValue) => {
        currentName += 1;
        const copiedValueOptions = Object.values(inputs).filter(
          ({ value }) => value === copiedValue
        );

        const filteredWords = filterWords(copiedValue);
        const changeStatus = () => {
          if (filteredWords.includes(copiedValue)) return 'filled';
          if (filteredWords.length !== 0) return 'filling';
          return 'focused';
        };

        return {
          ...acc,
          [currentName]: {
            ...inputs[currentName],
            value: copiedValue,
            autocompleteOptions:
              copiedValueOptions.length === 0
                ? filteredWords
                : copiedValueOptions[0].autocompleteOptions,
            status: changeStatus(),
          },
        };
      }, {});
      const copiedAndRestValues = { ...inputs, ...fillRest };
      const nearstUnfilledField = getNearestUnfilledField(copiedAndRestValues);
      setInputs(copiedAndRestValues);
      setActiveField(nearstUnfilledField);
    });
  };

  const changeHandler = (event) => {
    event.preventDefault();
    const { target } = event;
    const { value } = target;

    setFocusedOption(0);
    setCoords(0);

    if (value === '') {
      setInputs({
        ...inputs,
        [target.name]: {
          ...inputs[target.name],
          autocompleteOptions: options,
          value,
          status: 'filling',
        },
      });
    }

    if (value.trim() === '') return;

    const filteredHintsList = filterWords(value);

    let status;

    if (filteredHintsList.includes(value)) {
      const nearstUnfilledField = getNearestUnfilledField();
      status = 'filled';

      setActiveField(nearstUnfilledField);
    } else if (filteredHintsList.length !== 0) {
      status = 'filling';
    } else {
      status = 'focused';
    }

    setInputs({
      ...inputs,
      [target.name]: {
        ...inputs[target.name],
        autocompleteOptions: filteredHintsList,
        value,
        status,
      },
    });
  };

  const showOptions = (inputOptions, id) => {
    optionRefs.current = inputOptions.map((option, i) => optionRefs.current[i] ?? createRef());

    return (
      <div className="autocomplete-list">
        {inputOptions.map((option, index) => (
          <div
            key={_.uniqueId()}
            id={`${index}`}
            className={classNames('autocomplete-item', { focused: index === focusedOption })}
            ref={optionRefs.current[index]}
            data-input={id}
          >
            {option}
          </div>
        ))}
      </div>
    );
  };

  const focusHandler = (id) => () => {
    if (id !== activeField) {
      setCoords(0);
      setFocusedOption(0);
    }
    if (formState === 'filled' || formState === 'confirmed') return setActiveField(id);
    setFormState('updated');
    setActiveField(id);
  };

  const inputsList = Object.entries(inputs);
  fieldRefs.current = inputsList.map((field, i) => fieldRefs.current[i] ?? createRef());

  return inputsList.map(([, { id, autocompleteOptions, status, value }], i) => (
    <td key={_.uniqueId()}>
      <div
        className={classNames('input__field', {
          wrong__word: status === 'unconfirmed word',
        })}
      >
        <span className="number">{id}</span>
        <div className="autocomplete-wrap">
          <input
            type="text"
            id={id}
            autoComplete="off"
            name={id}
            className={classNames('autocomplete-input', {
              filled: status === 'filled',
              input__out: formState === 'confirmed',
              wrong__word__input: status === 'unconfirmed word',
            })}
            ref={fieldRefs.current[i]}
            value={value}
            onKeyDown={keyDownHandler}
            onChange={changeHandler}
            onPaste={pasteHandler}
            onClick={(e) => e.stopPropagation()}
            onFocus={focusHandler(id)}
            autoFocus={activeField === id && formState !== 'disable' && formState !== 'confirmed'}
          />
          {activeField === id &&
          status === 'filling' &&
          formState !== 'firstLoad' &&
          formState !== 'disable'
            ? showOptions(autocompleteOptions, id)
            : null}
        </div>
      </div>
    </td>
  ));
});

export default Field;
