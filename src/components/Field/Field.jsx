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
  } = props;
  let focusOption = 1;

  const keyDownHandler = (event) => {
    const { target, keyCode } = event;
    const { name } = target;

    const hasOptions = optionRefs.current.length !== 0 && optionRefs.current[0].current;

    const scrollOptions = () => {
      optionRefs.current[focusOption - 1].current.classList.add('focused');
      optionRefs.current[focusOption - 1].current.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    };

    if ((keyCode === 40 || keyCode === 9) && hasOptions) {
      // arrow down and tab
      event.preventDefault();
      optionRefs.current[focusOption - 1].current.classList.remove('focused');
      focusOption = focusOption === optionRefs.current.length ? 1 : focusOption + 1;
      scrollOptions();
    } else if (keyCode === 38 && hasOptions) {
      // arrow up
      event.preventDefault();
      optionRefs.current[focusOption - 1].current.classList.remove('focused');
      focusOption = focusOption <= 1 ? optionRefs.current.length : focusOption - 1;
      scrollOptions();
    } else if (keyCode === 27) {
      // escape
      event.preventDefault();
      unfocusAllItems();
    } else if (keyCode === 13 && hasOptions) {
      // enter
      const currentOptionValue = optionRefs.current[focusOption - 1].current.textContent;
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
      const copiedValues = clipText.split(',');
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
    const { value, name } = target;

    setFormState('updated');
    setActiveField(name);

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
            className={classNames('autocomplete-item', { focused: index === 0 })}
            ref={optionRefs.current[index]}
            data-input={id}
          >
            {option}
          </div>
        ))}
      </div>
    );
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
            id="autocomplete"
            autoComplete="off"
            tabIndex={id}
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
            autoFocus={activeField === id && formState !== 'disable'}
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
