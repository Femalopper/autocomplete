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
  const [inputs, setInputs] = useState(fields);
  const [formState, setFormState] = useState('firstLoad');
  const [submitBtnDisable, setSubmitBtnDisable] = useState(true);
  const [activeField, setActiveField] = useState('1');
  let focusOption = 1;

  useEffect(() => {
    const filledFealds = Object.values(inputs).filter(
      ({ status }) => status === 'filled' || status === 'focus filled'
    );
    setSubmitBtnDisable(filledFealds.length !== fieldRefs.current.length);
    if (filledFealds.length === fieldRefs.current.length) {
      setFormState('filled');
    }
  }, [inputs, formState]);

  const getNearestUnfilledField = (fields = inputs) => {
    const nearstUnfocusedField = Object.values(fields).filter(
      ({ status, id }) => status !== 'filled' && id !== activeField
    );
    if (nearstUnfocusedField.length === 0) return;
    const [first] = nearstUnfocusedField;
    return first.id;
  };

  const copy = (id) => {
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
      if (!id) {
        const nearstUnfilledField = getNearestUnfilledField();
        if (!nearstUnfilledField) return;
        setActiveField(nearstUnfilledField);

        setInputs({
          ...inputs,
          [nearstUnfilledField]: {
            ...inputs[nearstUnfilledField],
            status: 'focused',
          },
        });
      } else {
        setInputs({
          ...inputs,
          [id.id]: {
            ...inputs[id.id],
            status:
              id.status === 'filled' || id.status === 'focus filled' ? 'focus filled' : 'focused',
          },
        });
      }
    }, 500);
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

        const filterWords = () => {
          const sortedOptions = options.sort((a, b) => a.localeCompare(b));
          const inputLetters = copiedValue.toLowerCase();
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

          const filteredHintsList = sortedOptions.slice(
            filterLeftOptions(),
            filterRightOptions() + 1
          );
          return filteredHintsList;
        };

        return {
          ...acc,
          [currentName]: {
            ...inputs[currentName],
            value: copiedValue,
            autocompleteOptions:
              copiedValueOptions.length === 0
                ? filterWords()
                : copiedValueOptions[0].autocompleteOptions,
            status: filterWords().includes(copiedValue) ? 'filled' : 'unfocused',
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
    const inputObjects = Object.values(inputs);
    const currentFocusedItem = inputObjects.filter(
      ({ status }) => status === 'focused' || status === 'focus filled' || status === 'filling'
    );

    const currentFocusedItemId = currentFocusedItem[0].id;
    setInputs({
      ...inputs,
      [currentFocusedItemId]: {
        ...inputs[currentFocusedItemId],
        status:
          inputs[currentFocusedItemId].status === 'focused' ||
          inputs[currentFocusedItemId].status === 'filling'
            ? 'unfocused'
            : 'filled',
      },
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
          status: 'focused',
        },
      });
      return;
    }

    if (value.trim() === '') return;

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
    console.log(filteredHintsList);

    if (filteredHintsList.includes(inputLetters)) {
      const nearstUnfilledField = getNearestUnfilledField();

      if (!nearstUnfilledField) {
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
      }

      setActiveField(nearstUnfilledField);

      setInputs({
        ...inputs,
        [target.name]: {
          ...inputs[target.name],
          autocompleteOptions: filteredHintsList,
          value,
          status: 'filled',
        },
        [nearstUnfilledField]: {
          ...inputs[nearstUnfilledField],
          status: 'filling',
        },
      });
      return;
    } else if (filterLeftOptions() >= 0 || filterRightOptions() >= 0) {
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
    let nearstUnfilledField = getNearestUnfilledField();
    setActiveField(nearstUnfilledField);
    if (!nearstUnfilledField) {
      setInputs({
        ...inputs,
        [id]: { ...inputs[id], value: option, autocompleteOptions: [], status: 'filled' },
      });
      return;
    }

    setInputs({
      ...inputs,
      [id]: { ...inputs[id], value: option, autocompleteOptions: [], status: 'filled' },
      [nearstUnfilledField]: { ...inputs[nearstUnfilledField], status: 'filling' },
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
    const { name, value } = target;

    if (target.classList.contains('autocomplete-item')) {
      const inputId = event.target.dataset.input;
      return selectItem(event.target.textContent, inputId);
    }

    const inputObjects = Object.values(inputs);
    const lastFocusedItem = inputObjects.filter(
      ({ status }) => status === 'focused' || status === 'focus filled' || status === 'filling'
    );

    if (target.classList.contains('copy')) {
      return copy(lastFocusedItem[0]);
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
      setFormState('disable');
      return;
    }
  };

  //event is fired when a key is pressed
  const keyUpHandler = (event) => {
    const keyCode = event.keyCode;
    const { target } = event;
    const { name } = target;

    if ((keyCode === 40 || keyCode === 9) && inputs[name].status === 'filling') {
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
      console.log(inputs[name].status);
      event.preventDefault();
      if (inputs[name].status === 'filling') {
        const currentOptionValue = optionRefs.current[focusOption - 1].current.textContent;
        selectItem(currentOptionValue, name);
      }
    }
  };

  const makeField = () => {
    console.log(inputs);
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
                filled: status === 'filled' || status === 'focus filled',
              })}
              ref={fieldRefs.current[i]}
              value={value}
              onKeyDown={keyUpHandler}
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
