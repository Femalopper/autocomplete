/* eslint consistent-return: off */

import React, { useState, useRef, useEffect, createRef } from 'react';
import './Form.css';
import _ from 'lodash';
import classNames from 'classnames';
import Swal from 'sweetalert2';
import fields from '../data/fields.json';
import options from '../data/words.json';

function Form() {
  const fieldRefs = useRef([]);
  const optionRefs = useRef([]);
  const formRef = useRef();
  const copyBtnRef = useRef();
  const submitBtnRef = useRef();
  const confirmBtnRef = useRef();
  const [inputs, setInputs] = useState(fields);
  const [formState, setFormState] = useState('firstLoad');
  const [submitBtnDisable, setSubmitBtnDisable] = useState(true);
  const [confirmBtnDisable, setConfirmBtnDisable] = useState(true);
  const [activeField, setActiveField] = useState('1');
  const [submitFormData, setSubmitFormData] = useState('');
  let focusOption = 1;

  const unfocusAllItems = () => {
    setFormState('disable');
  };

  const submitForm = () => {
    setInputs(fields);
    setFormState('submitted');
    setSubmitBtnDisable(true);
    setActiveField('1');
    setConfirmBtnDisable(true);
    focusOption = 1;
  };

  useEffect(() => {
    const filledFealds = Object.values(inputs).filter(({ status }) => status === 'filled');
    setSubmitBtnDisable(filledFealds.length !== fieldRefs.current.length);
    setConfirmBtnDisable(filledFealds.length !== fieldRefs.current.length);
    if (filledFealds.length === fieldRefs.current.length) {
      unfocusAllItems();
      setFormState('filled');
      if (submitFormData === '') {
        copyBtnRef.current.focus();
      } else {
        confirmBtnRef.current.focus();
      }
    }
  }, [inputs, submitFormData, confirmBtnDisable]);

  const getNearestUnfilledField = (inputFields = inputs) => {
    const nearstUnfilledField = Object.values(inputFields).filter(
      ({ status, id }) => status !== 'filled' && id !== activeField
    );
    if (nearstUnfilledField.length === 0) return;
    const [first] = nearstUnfilledField;
    return first.id;
  };

  const copy = () => {
    const currentValues = Object.values(inputs).reduce((acc, { value }) => {
      if (value !== '') {
        return [...acc, value];
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
      setFormState('copied');
    }, 500);
  };

  // filter the list of hints according to the pressed key
  const filterWords = (value) => {
    const sortedOptions = options.sort((a, b) => a.localeCompare(b));
    const inputLetters = value.toLowerCase();
    // filter the list of hints according to the pressed key
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
        }
        if (midWordSubstring < inputLetters) {
          low = midWordIndex + 1;
        } else if (midWordSubstring > inputLetters) {
          high = midWordIndex - 1;
        }
      }
    };

    const midWord = filterOptions();

    const filterLeftRightOptions = (l, h) => {
      const midWordIndex = Math.floor((l + h) / 2);
      const midWordSubstring = sortedOptions[midWordIndex]
        .slice(0, inputLetters.length)
        .toLowerCase();
      return [midWordIndex, midWordSubstring];
    };

    const filterLeftOptions = () => {
      let low = 0;
      const high = midWord;

      while (low <= high) {
        const [midWordIndex, midWordSubstring] = filterLeftRightOptions(low, high);
        if (midWordSubstring === inputLetters) {
          return midWordIndex;
        }
        if (midWordSubstring < inputLetters) {
          low = midWordIndex + 1;
        }
      }
    };

    const filterRightOptions = () => {
      const low = midWord;
      let high = options.length - 1;

      while (low <= high) {
        const [midWordIndex, midWordSubstring] = filterLeftRightOptions(low, high);
        if (midWordSubstring === inputLetters) {
          return midWordIndex;
        }
        if (midWordSubstring > inputLetters) {
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
      return;
    }

    if (value.trim() === '') return;

    const inputLetters = value.toLowerCase();

    const filteredHintsList = filterWords(value);

    let status;

    if (filteredHintsList.includes(inputLetters)) {
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

  const selectItem = (option, id) => {
    const nearstUnfilledField = getNearestUnfilledField();
    setActiveField(nearstUnfilledField);

    setInputs({
      ...inputs,
      [id]: {
        ...inputs[id],
        value: option,
        autocompleteOptions: [],
        status: 'filled',
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

  const clickHandler = async (event) => {
    event.preventDefault();
    const { target } = event;
    const { name, textContent, dataset } = target;

    if (target.classList.contains('submit')) {
      setSubmitFormData(inputs);
      submitForm();
      return;
    }

    if (target.classList.contains('confirm')) {
      const getInputValues = (data) => {
        const inputValues = Object.values(data).map(({ value }) => value);
        return inputValues.join('');
      };

      const findWrongWords = () => {
        const wrongWordsId = [];

        let id = 1;
        while (id <= fieldRefs.current.length) {
          if (submitFormData[`${id}`].value !== inputs[`${id}`].value) {
            wrongWordsId.push(`${id}`);
          }
          id += 1;
        }

        const wrongWordsObj = wrongWordsId.reduce(
          (acc, wrongWordId) => ({
            ...acc,
            [wrongWordId]: { ...inputs[wrongWordId], status: 'unconfirmed word' },
          }),
          {}
        );

        setInputs({
          ...inputs,
          ...wrongWordsObj,
        });

        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Mistake! Try again!',
          confirmButtonColor: 'rgba(127, 255, 212, 0.4)',
          didClose: () => {
            setActiveField(wrongWordsId[0]);
          },
        });
      };

      const submitData = getInputValues(submitFormData);
      const confirmData = getInputValues(inputs);
      return submitData === confirmData ? setFormState('confirmed') : findWrongWords();
    }

    if (target.classList.contains('autocomplete-item')) {
      const inputId = dataset.input;
      return selectItem(textContent, inputId);
    }

    if (target.classList.contains('copy')) {
      return copy();
    }

    if (target.classList.contains('autocomplete-input')) {
      setActiveField(name);
      setFormState('updated');
    }

    if (!target.classList.contains('autocomplete-input')) {
      unfocusAllItems();
    }
  };

  // event is fired when a key is pressed
  const keyDownHandler = (event) => {
    const { keyCode } = event;
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
      if (optionRefs.current.length !== 0 && optionRefs.current[0].current) {
        const currentOptionValue = optionRefs.current[focusOption - 1].current.textContent;
        selectItem(currentOptionValue, name);
      }
    }
  };

  const makeField = () => {
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
  };

  return (
    <div className="wrapper" onClick={clickHandler} role="presentation">
      <main id="page1" className="main">
        {formState === 'confirmed' ? (
          <ul id="success" className="animate-ul">
            <li>S</li>
            <li>U</li>
            <li>C</li>
            <li>C</li>
            <li>E</li>
            <li>S</li>
            <li>S</li>
          </ul>
        ) : (
          <h4>
            {submitFormData !== ''
              ? 'Enter your seed phrase to confirm you wrote it down properly'
              : 'Enter your seed phrase'}
          </h4>
        )}
        <form className="input__wrap" ref={formRef}>
          <table>
            <tbody>
              <tr className="row">{makeField()}</tr>
              {submitFormData !== '' ? (
                <tr className="row">
                  <td>
                    <button
                      id="copy__button"
                      type="button"
                      className={classNames('confirm', { btn_out: formState === 'confirmed' })}
                      ref={confirmBtnRef}
                      disabled={confirmBtnDisable}
                    >
                      Confirm
                    </button>
                  </td>
                </tr>
              ) : (
                <tr className="row">
                  <td>
                    <button type="button" id="copy__button" className="copy" ref={copyBtnRef}>
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
              )}
            </tbody>
          </table>
        </form>
      </main>
    </div>
  );
}

export default Form;
