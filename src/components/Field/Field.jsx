/* eslint consistent-return: off */

import React, { useRef, createRef, forwardRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import options from '../../data/words.json';
import filterWords from './autocomplete';

const Field = forwardRef((props, ref) => {
  const optionRefs = useRef([]);
  const fakeFocusRef = useRef([]);
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
    wrongWords,
    confirmBtnDisable,
    submitFormData,
  } = props;

  const keyDownHandler = (event) => {
    const { target, code } = event;
    const { name } = target;

    const hasOptions = optionRefs.current.length !== 0 && optionRefs.current[0].current;
    const keyCodes = ['ArrowUp', 'ArrowDown', 'Enter'];
    const keyCodeBehavior = {
      // arrow up
      ArrowUp: () => {
        event.preventDefault();
        const optionHeight = optionRefs.current[0].current.getBoundingClientRect().height;
        if (focusedOption === 0) {
          setFocusedOption(optionRefs.current.length - 1);
          setCoords(optionHeight * (optionRefs.current.length - 1));
        } else {
          setFocusedOption(focusedOption - 1);
          setCoords(coords - optionHeight);
        }
      },
      // arrow down
      ArrowDown: () => {
        event.preventDefault();
        const optionHeight = optionRefs.current[0].current.getBoundingClientRect().height;
        if (focusedOption === optionRefs.current.length - 1) {
          setFocusedOption(0);
          setCoords(0);
        } else {
          setFocusedOption(focusedOption + 1);
          setCoords(coords + optionHeight);
        }
      },
      // enter
      Enter: () => {
        const currentOptionValue = optionRefs.current[focusedOption].current.textContent;
        selectItem(currentOptionValue, name);
        event.preventDefault();
      },
    };

    if (keyCodes.includes(code) && hasOptions) {
      keyCodeBehavior[code]();
    }

    if (code === 'Escape') {
      // escape
      event.preventDefault();
      unfocusAllItems();
      fakeFocusRef.current.focus();
    }
    if (
      code === 'Tab' &&
      +activeField === fieldRefs.current.length &&
      confirmBtnDisable &&
      submitFormData !== ''
    ) {
      unfocusAllItems();
      fakeFocusRef.current.focus();
    }
  };

  const pasteHandler = (event) => {
    event.preventDefault();
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

        const filteredWords = filterWords(copiedValue, options);

        const changeStatus = () => {
          let status;
          if (_.has(wrongWords, currentName) && wrongWords[currentName] === copiedValue) {
            status = 'unconfirmed word';
          } else if (formState === 'unconfirmed' && filteredWords.includes(copiedValue)) {
            status = 'unconfirmed filled';
          } else if (filteredWords.includes(copiedValue)) status = 'filled';
          else if (filteredWords.length !== 0) status = 'filling';
          else status = 'focused';
          return status;
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
      if (nearstUnfilledField) {
        fieldRefs.current[nearstUnfilledField - 1].current.focus();
        setActiveField(nearstUnfilledField);
      }
    });
  };

  const changeHandler = (event) => {
    event.preventDefault();
    const { target } = event;
    const { value, name } = target;

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

    const filteredHintsList = filterWords(value, options);
    const nearstUnfilledField = getNearestUnfilledField();

    const focusNearestUnfilled = () => {
      if (nearstUnfilledField) {
        fieldRefs.current[nearstUnfilledField - 1].current.focus();
        setActiveField(nearstUnfilledField);
      }
    };

    let status;

    if (_.has(wrongWords, name) && wrongWords[name] === value) {
      status = 'unconfirmed word';
      focusNearestUnfilled();
    } else if (formState === 'unconfirmed' && filteredHintsList.includes(value)) {
      status = 'unconfirmed filled';
      focusNearestUnfilled();
    } else if (filteredHintsList.includes(value)) {
      status = 'filled';
      focusNearestUnfilled();
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
            key={option}
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
    setActiveField(id);
    if (formState === 'filled' || formState === 'confirmed' || formState === 'unconfirmed') {
      return;
    }
    if (formState === 'disable unconfirmed') {
      return setFormState('unconfirmed');
    }
    setFormState('updated');
  };

  const inputsList = Object.entries(inputs);
  fieldRefs.current = inputsList.map((field, i) => fieldRefs.current[i] ?? createRef());

  return inputsList.map(([, { id, autocompleteOptions, status, value }], i) => (
    <td key={id}>
      <div
        className={classNames('input__field', {
          wrong__word: status === 'unconfirmed word',
          unconfirmed__filled: status === 'unconfirmed filled',
          input__out__confirmed: formState === 'confirmed',
        })}
      >
        <span className="number">{id}</span>
        <div className="autocomplete-wrap">
          <input
            type="text"
            id={id}
            autoComplete="off"
            tabIndex={id}
            name={id}
            className={classNames('autocomplete-input', {
              filled: status === 'filled',
              unconfirmed__filled__input: status === 'unconfirmed filled',
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
          />
          {activeField === id &&
          status === 'filling' &&
          formState !== 'disable' &&
          formState !== 'disable unconfirmed'
            ? showOptions(autocompleteOptions, id)
            : null}
          {+id === fieldRefs.current.length ? (
            <button type="button" ref={fakeFocusRef} className="fake__focus">
              F
            </button>
          ) : null}
        </div>
      </div>
    </td>
  ));
});

export default Field;
