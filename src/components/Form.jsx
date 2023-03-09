import React, { useState, useRef, useEffect } from 'react';
import './Form.css';
import _ from 'lodash';
import fields from '../data/fields.json';
import classNames from 'classnames';
import options from '../data/words.json';

const Form = () => {
  const fieldRef = useRef(null);
  const [inputs, setInputs] = useState(fields);
  const [formState, setFormState] = useState('firstLoad');
  const [focusOption, setFocusOption] = useState(0);

  const getNearestUnfocusedField = () => {
    const nearstUnfocusedField = Object.values(inputs).filter(
      ({ status }) => status === 'unfocused'
    );
    const [first] = nearstUnfocusedField;
    const nearstUnfocusedFieldId = first.id;
    return nearstUnfocusedFieldId;
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

  const selectItem = (option, id) => (event) => {
    const nearstUnfocusedField = getNearestUnfocusedField();

    event.preventDefault();
    setInputs({
      ...inputs,
      [id]: { ...inputs[id], value: option, status: 'filled' },
      [nearstUnfocusedField]: { ...inputs[nearstUnfocusedField], status: 'focused' },
    });
  };

  const showOptions = (options, id) => {
    return (
      <div className="autocomplete-list">
        {options.map((option, index) => (
          <div
            key={_.uniqueId()}
            className={classNames('autocomplete-item', { focused: index === focusOption })}
            onClick={selectItem(option, id)}
          >
            {option}
          </div>
        ))}
      </div>
    );
  };

  const autofocus = (event) => {
    event.preventDefault();
    const { target } = event;
    const { name } = target;

    if (target.classList.contains('autocomplete-item')) {
      return;
    }

    const inputObjects = Object.values(inputs);
    const currentFocusedItem = inputObjects.filter(
      ({ status }) => status === 'focused' || status === 'focus filled'
    );

    if (currentFocusedItem.length === 0 && target.classList.contains('autocomplete-input')) {
      setInputs({
        ...inputs,
        [name]: { ...inputs[name], status: 'focused' },
      });
      return;
    }
    if (currentFocusedItem.length === 0) {
      return;
    }
    const currentFocusedItemId = currentFocusedItem[0].id;
    if (!target.classList.contains('autocomplete-input')) {
      setInputs({
        ...inputs,
        [currentFocusedItemId]: { ...inputs[currentFocusedItemId], status: 'unfocused' },
      });
      return;
    }
    if (currentFocusedItem.length !== 0 && target.classList.contains('autocomplete-input')) {
      setInputs({
        ...inputs,
        [name]: {
          ...inputs[name],
          status: inputs[name].status === 'unfocused' ? 'focused' : 'focus filled',
        },
        [currentFocusedItemId]: {
          ...inputs[currentFocusedItemId],
          status:
            inputs[currentFocusedItemId].status === 'focused' ? 'unfocused' : 'unfocus filled',
        },
      });
      return;
    }
    if (currentFocusedItemId !== name && target.classList.contains('autocomplete-input')) {
      setInputs({
        ...inputs,
        [name]: { ...inputs[name], status: 'focused' },
        [currentFocusedItemId]: {
          ...inputs[currentFocusedItemId],
          status: 'unfocused',
        },
      });
      return;
    }
  };

  const makeField = () => {
    const inputsList = Object.entries(inputs);

    return inputsList.map(([, { id, autocompleteOptions, status, value }]) => (
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
              ref={fieldRef}
              value={value}
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
    <div className="wrapper" onClick={autofocus}>
      <main id="page1" className="main">
        <h4>Enter your seed phrase</h4>
        <form className="input__wrap">
          <table>
            <tbody>
              <tr className="row">{makeField()}</tr>
              <tr className="row">
                <td>
                  <button id="copy__button" className="submit">
                    Copy
                  </button>
                </td>
                <td id="buttn">
                  <button type="submit" id="submit__button" className="submit">
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
