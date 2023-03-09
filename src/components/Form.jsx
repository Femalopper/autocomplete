import React, { useState, useRef } from 'react';
import './Form.css';
import _ from 'lodash';
import fields from '../data/fields.json';
import classNames from 'classnames';
import options from '../data/words.json';

const Form = () => {
  const fieldRef = useRef(null);
  const [inputs, setInputs] = useState(fields);

  const changeHandler = (event) => {
    event.preventDefault();

    const { target } = event;
    const { value } = target;

    const lowerLetterWords = options.map((option) => option.toLowerCase());
    const sortedOptions = lowerLetterWords.sort();
    const inputLetters = value.toLowerCase();
    //filter the list of hints according to the pressed key
    const filterOptions = () => {
      let low = 0;
      let high = sortedOptions.length - 1;

      while (low <= high) {
        const midWordIndex = Math.floor((low + high) / 2);
        const midWordSubstring = sortedOptions[midWordIndex].slice(0, inputLetters.length);
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
        const midWordSubstring = sortedOptions[midWordIndex].slice(0, inputLetters.length);
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
        const midWordSubstring = sortedOptions[midWordIndex].slice(0, inputLetters.length);
        if (midWordSubstring === inputLetters) {
          return midWordIndex;
        } else if (midWordSubstring > inputLetters) {
          high = midWordIndex - 1;
        }
      }
    };

    const filteredHintsList = sortedOptions.slice(filterLeftOptions(), filterRightOptions() + 1);

    if (filteredHintsList.includes(inputLetters)) {
      setInputs({
        ...inputs,
        [target.name]: {
          ...inputs[target.name],
          autocompleteOptions: filteredHintsList,
          value,
          status: 'filled',
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
    event.preventDefault();
    setInputs({ ...inputs, [id]: { ...inputs[id], value: option, status: 'filled' } });
  };

  const showOptions = (options, id) => {
    return (
      <div className="autocomplete-list">
        {options.map((option) => (
          <div key={_.uniqueId()} className="autocomplete-item" onClick={selectItem(option, id)}>
            {option}
          </div>
        ))}
      </div>
    );
  };

  const autofocus = (id) => (event) => {
    event.preventDefault();
    const inputObjects = Object.values(inputs);
    const currentFocusedItem = inputObjects.filter(({ status }) => status === 'focused');
    const currentFocusedItemId = currentFocusedItem[0].id;
    if (currentFocusedItemId !== id) {
      setInputs({
        ...inputs,
        [id]: { ...inputs[id], status: 'focused' },
        [currentFocusedItemId]: {
          ...inputs[currentFocusedItemId],
          status: 'unfocused',
        },
      });
    }
  };

  const makeField = () => {
    const inputsList = Object.entries(inputs);
    console.log(inputs);

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
              className={classNames('autocomplete-input', { filled: status === 'filled' })}
              ref={fieldRef}
              value={value}
              onChange={changeHandler}
              onClick={autofocus(id)}
              autoFocus={status === 'focused'}
            />
            {status === 'focused' ? showOptions(autocompleteOptions, id) : null}
          </div>
        </div>
      </td>
    ));
  };

  return (
    <div className="wrapper">
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
