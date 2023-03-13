import React, { useState, useRef, useEffect, createRef } from 'react';
import './Form.css';
import _ from 'lodash';
import fields from '../data/fields.json';
import classNames from 'classnames';
import options from '../data/words.json';

const Form = () => {
  const fieldRefs = useRef([]);
  const optionRefs = useRef([]);
  const copyBtnRef = useRef();
  const submitBtnRef = useRef();
  const [inputs, setInputs] = useState(fields);
  const [formState, setFormState] = useState('firstLoad');
  const [submitBtnDisable, setSubmitBtnDisable] = useState(true);
  const [activeField, setActiveField] = useState('1');
  let focusOption = 1;

  useEffect(() => {
    const filledFealds = Object.values(inputs).filter(({ status }) => status === 'filled');
    setSubmitBtnDisable(filledFealds.length !== fieldRefs.current.length);
    if (filledFealds.length === fieldRefs.current.length) {
      setFormState('filled');
      unfocusAllItems();
      copyBtnRef.current.focus();
    }
  }, [inputs]);

  const getNearestUnfilledField = (fields = inputs) => {
    const nearstUnfilledField = Object.values(fields).filter(
      ({ status, id }) => status !== 'filled' && id !== activeField
    );
    if (nearstUnfilledField.length === 0) return;
    const [first] = nearstUnfilledField;
    return first.id;
  };

  const copy = () => {
    const currentValues = Object.values(inputs).reduce((acc, { value }) => {
      if (value !== '') {
        acc = [...acc, value];
      }
      return acc;
    }, []);
    navigator.clipboard.writeText(currentValues);
    copyBtnRef.current.innerHTML = 'Copied';
    setTimeout(() => {
      copyBtnRef.current.innerHTML = 'Copy';
      const nearstUnfilledField = getNearestUnfilledField();
      if (!nearstUnfilledField) {
        submitBtnRef.current.focus();
        return;
      }
      setActiveField(nearstUnfilledField);
    }, 500);
  };

  //filter the list of hints according to the pressed key
  const filterWords = (value) => {
    const sortedOptions = options.sort((a, b) => a.localeCompare(b));
    const inputLetters = value.toLowerCase();
    //filter the list of hints according to the pressed key
    const filterOptions = () => {
      let low = 0;
      let high = sortedOptions.length - 1;

      while (low <= high) {
        const midWordIndex = Math.floor((low + high) / 2);
        const midWordSubstring = sortedOptions[midWordIndex]
          .slice(0, inputLetters.length)
          .toLowerCase();
        if (midWordSubstring === inputLetters) {
          return midWordIndex;
        } else if (midWordSubstring < inputLetters) {
          low = midWordIndex + 1;
        } else if (midWordSubstring > inputLetters) {
          high = midWordIndex - 1;
        }
      }
    };

    const midWord = filterOptions();

    const filterLeftOptions = () => {
      let low = 0;
      let high = midWord;

      while (low <= high) {
        const midWordIndex = Math.floor((low + high) / 2);
        const midWordSubstring = sortedOptions[midWordIndex]
          .slice(0, inputLetters.length)
          .toLowerCase();
        if (midWordSubstring === inputLetters) {
          return midWordIndex;
        } else if (midWordSubstring < inputLetters) {
          low = midWordIndex + 1;
        }
      }
    };

    const filterRightOptions = () => {
      let low = midWord;
      let high = options.length - 1;

      while (low <= high) {
        const midWordIndex = Math.floor((low + high) / 2);
        const midWordSubstring = sortedOptions[midWordIndex]
          .slice(0, inputLetters.length)
          .toLowerCase();
        if (midWordSubstring === inputLetters) {
          return midWordIndex;
        } else if (midWordSubstring > inputLetters) {
          high = midWordIndex - 1;
        }
      }
    };

    const filteredHintsList = sortedOptions.slice(filterLeftOptions(), filterRightOptions() + 1);
    return filteredHintsList;
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

        return {
          ...acc,
          [currentName]: {
            ...inputs[currentName],
            value: copiedValue,
            autocompleteOptions:
              copiedValueOptions.length === 0
                ? filterWords(copiedValue)
                : copiedValueOptions[0].autocompleteOptions,
            status: filterWords(copiedValue).includes(copiedValue)
              ? 'filled'
              : filterWords(copiedValue).length !== 0
              ? 'filling'
              : 'focused',
          },
        };
      }, {});
      const copiedAndRestValues = { ...inputs, ...fillRest };
      const nearstUnfilledField = getNearestUnfilledField(copiedAndRestValues);
      setInputs(copiedAndRestValues);
      setActiveField(nearstUnfilledField);
    });
  };

  const unfocusAllItems = () => {
    setFormState('disable');
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
      return;
    }

    if (value.trim() === '') return;

    const inputLetters = value.toLowerCase();

    const filteredHintsList = filterWords(value);

    if (filteredHintsList.includes(inputLetters)) {
      const nearstUnfilledField = getNearestUnfilledField();

      setActiveField(nearstUnfilledField);

      setInputs({
        ...inputs,
        [target.name]: {
          ...inputs[target.name],
          autocompleteOptions: filteredHintsList,
          value,
          status: 'filled',
        },
      });
      return;
    } else if (filteredHintsList.length !== 0) {
      setInputs({
        ...inputs,
        [target.name]: {
          ...inputs[target.name],
          autocompleteOptions: filteredHintsList,
          value,
          status: 'filling',
        },
      });
      return;
    } else {
      setInputs({
        ...inputs,
        [target.name]: {
          ...inputs[target.name],
          autocompleteOptions: [],
          value,
          status: 'focused',
        },
      });
    }
  };

  const selectItem = (option, id) => {
    const nearstUnfilledField = getNearestUnfilledField();
    setActiveField(nearstUnfilledField);

    setInputs({
      ...inputs,
      [id]: { ...inputs[id], value: option, autocompleteOptions: [], status: 'filled' },
    });
  };

  const showOptions = (options, id) => {
    optionRefs.current = options.map((_, i) => optionRefs.current[i] ?? createRef());

    return (
      <div className="autocomplete-list">
        {options.map((option, index) => (
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

  const clickHandler = (event) => {
    event.preventDefault();
    const { target } = event;
    const { name, value, textContent, dataset } = target;

    if (target.classList.contains('autocomplete-item')) {
      const inputId = dataset.input;
      return selectItem(textContent, inputId);
    }

    if (target.classList.contains('copy')) {
      return copy();
    }

    if (target.classList.contains('autocomplete-input')) {
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
        return;
      }
      return;
    }

    if (!target.classList.contains('autocomplete-input')) {
      return unfocusAllItems();
    }
  };

  //event is fired when a key is pressed
  const keyDownHandler = (event) => {
    const keyCode = event.keyCode;
    const { target } = event;
    const { name } = target;

    if ((keyCode === 40 || keyCode === 9) && optionRefs.current[0].current) {
      // arrow down and tab
      event.preventDefault();
      optionRefs.current[focusOption - 1].current.classList.remove('focused');
      focusOption = focusOption === optionRefs.current.length ? 1 : focusOption + 1;
      optionRefs.current[focusOption - 1].current.classList.add('focused');
      optionRefs.current[focusOption - 1].current.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    } else if (keyCode === 38 && inputs[name].status === 'filling') {
      // arrow up
      event.preventDefault();
      optionRefs.current[focusOption - 1].current.classList.remove('focused');
      focusOption = focusOption <= 1 ? optionRefs.current.length : focusOption - 1;
      optionRefs.current[focusOption - 1].current.classList.add('focused');
      optionRefs.current[focusOption - 1].current.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    } else if (keyCode === 27) {
      // escape
      event.preventDefault();
      unfocusAllItems();
    } else if (keyCode === 13) {
      // enter
      event.preventDefault();
      if (optionRefs.current[0].current) {
        const currentOptionValue = optionRefs.current[focusOption - 1].current.textContent;
        selectItem(currentOptionValue, name);
      }
    }
  };

  const makeField = () => {
    const inputsList = Object.entries(inputs);

    fieldRefs.current = inputsList.map((_, i) => fieldRefs.current[i] ?? createRef());

    return inputsList.map(([, { id, autocompleteOptions, status, value }], i) => (
      <td key={_.uniqueId()}>
        <div className="input__field">
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
  };

  return (
    <div className="wrapper" onClick={clickHandler}>
      <main id="page1" className="main">
        <h4>Enter your seed phrase</h4>
        <form className="input__wrap">
          <table>
            <tbody>
              <tr className="row">{makeField()}</tr>
              <tr className="row">
                <td>
                  <button id="copy__button" className="copy submit" ref={copyBtnRef}>
                    Copy
                  </button>
                </td>
                <td id="buttn">
                  <button
                    type="submit"
                    id="submit__button"
                    className="submit"
                    disabled={submitBtnDisable}
                    ref={submitBtnRef}
                  >
                    Submit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </main>
    </div>
  );
};

export default Form;
