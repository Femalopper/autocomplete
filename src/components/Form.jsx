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
  let focusOption = 1;

  useEffect(() => {
    const filledFealds = Object.values(inputs).filter(
      ({ status }) =>
        status === 'filled' || status === 'focus filled' || status === 'unfocus filled'
    );
    setSubmitBtnDisable(filledFealds.length !== fieldRefs.current.length);
  }, [inputs]);

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
    }, 500);
  };

  const getNearestUnfocusedField = () => {
    const nearstUnfocusedField = Object.values(inputs).filter(
      ({ status }) => status === 'unfocused'
    );
    if (nearstUnfocusedField.length === 0) return;
    const [first] = nearstUnfocusedField;
    const nearstUnfocusedFieldId = first.id;
    return nearstUnfocusedFieldId;
  };

  const unfocusAllItems = () => {
    const inputObjects = Object.values(inputs);
    const currentFocusedItem = inputObjects.filter(
      ({ status }) => status === 'focused' || status === 'focus filled'
    );
    const currentFocusedItemId = currentFocusedItem[0].id;
    setInputs({
      ...inputs,
      [currentFocusedItemId]: {
        ...inputs[currentFocusedItemId],
        status: inputs[currentFocusedItemId].status === 'focused' ? 'unfocused' : 'unfocus filled',
      },
    });
  };

  const changeHandler = (event) => {
    event.preventDefault();

    setFormState('updated');

    const { target } = event;
    const { value } = target;

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

    if (filteredHintsList.includes(inputLetters)) {
      const nearstUnfocusedField = getNearestUnfocusedField();

      if (!nearstUnfocusedField) {
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

      setInputs({
        ...inputs,
        [target.name]: {
          ...inputs[target.name],
          autocompleteOptions: filteredHintsList,
          value,
          status: 'filled',
        },
        [nearstUnfocusedField]: {
          ...inputs[nearstUnfocusedField],
          status: 'focused',
        },
      });
    } else {
      setInputs({
        ...inputs,
        [target.name]: {
          ...inputs[target.name],
          autocompleteOptions: filteredHintsList,
          value,
          status: 'focused',
        },
      });
    }
  };

  const selectItem = (option, id) => {
    const nearstUnfocusedField = getNearestUnfocusedField();
    if (!nearstUnfocusedField) {
      setInputs({
        ...inputs,
        [id]: { ...inputs[id], value: option, status: 'filled' },
      });
      return;
    }

    setInputs({
      ...inputs,
      [id]: { ...inputs[id], value: option, status: 'filled' },
      [nearstUnfocusedField]: { ...inputs[nearstUnfocusedField], status: 'focused' },
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
            onClick={() => selectItem(option, id)}
            ref={optionRefs.current[index]}
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
    const { name } = target;

    if (target.classList.contains('copy')) {
      return copy();
    }

    if (target.classList.contains('autocomplete-item')) {
      return;
    }

    const inputObjects = Object.values(inputs);
    const lastFocusedItem = inputObjects.filter(
      ({ status }) => status === 'focused' || status === 'focus filled'
    );

    if (lastFocusedItem.length === 0 && target.classList.contains('autocomplete-input')) {
      setInputs({
        ...inputs,
        [name]: {
          ...inputs[name],
          status: inputs[name].status === 'unfocused' ? 'focused' : 'focus filled',
        },
      });
      return;
    }
    if (lastFocusedItem.length === 0) {
      return;
    }
    const lastFocusedItemId = lastFocusedItem[0].id;
    if (!target.classList.contains('autocomplete-input')) {
      setInputs({
        ...inputs,
        [lastFocusedItemId]: {
          ...inputs[lastFocusedItemId],
          status: inputs[lastFocusedItemId].status === 'focused' ? 'unfocused' : 'unfocus filled',
        },
      });
      return;
    }
    if (lastFocusedItem.length !== 0 && target.classList.contains('autocomplete-input')) {
      setInputs({
        ...inputs,
        [name]: {
          ...inputs[name],
          status: inputs[name].status === 'unfocused' ? 'focused' : 'focus filled',
        },
        [lastFocusedItemId]: {
          ...inputs[lastFocusedItemId],
          status: inputs[lastFocusedItemId].status === 'focused' ? 'unfocused' : 'unfocus filled',
        },
      });
      return;
    }
    if (lastFocusedItemId !== name && target.classList.contains('autocomplete-input')) {
      setInputs({
        ...inputs,
        [name]: { ...inputs[name], status: 'focused' },
        [lastFocusedItemId]: {
          ...inputs[lastFocusedItemId],
          status: 'unfocused',
        },
      });
      return;
    }
  };

  //event is fired when a key is pressed
  const keyUpHandler = (event) => {
    const keyCode = event.keyCode;
    const { target } = event;
    const { name } = target;

    if ((keyCode === 40 || keyCode === 9) && optionRefs.current.length !== 0) {
      // arrow down and tab
      event.preventDefault();
      optionRefs.current[focusOption - 1].current.classList.remove('focused');
      focusOption = focusOption === optionRefs.current.length ? 1 : focusOption + 1;
      optionRefs.current[focusOption - 1].current.classList.add('focused');
      optionRefs.current[focusOption - 1].current.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    } else if (keyCode === 38 && optionRefs.current.length !== 0) {
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
      unfocusAllItems();
    } else if (keyCode === 13 && optionRefs.current.length !== 0) {
      // enter
      event.preventDefault();
      const currentOptionValue = optionRefs.current[focusOption - 1].current.textContent;
      selectItem(currentOptionValue, name);
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
                filled:
                  status === 'filled' || status === 'unfocus filled' || status === 'focus filled',
              })}
              ref={fieldRefs.current[i]}
              value={value}
              onKeyDown={keyUpHandler}
              onChange={changeHandler}
              autoFocus={status === 'focused' || status === 'focus filled'}
            />
            {(status === 'focused' || status === 'focus filled') && formState !== 'firstLoad'
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
