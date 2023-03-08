import React, { useState } from 'react';
import './Form.css';
import words from '../data/words.json';
import _ from 'lodash';
import fields from '../data/fields.json';
import classNames from 'classnames';

const Form = () => {
  const fieldRef = React.createRef();
  const [inputs, setInputs] = useState(fields);

  const changeHandler = (event) => {
    event.preventDefault();

    const { target } = event;
    const { value } = target;

    const inputLetters = value.toLowerCase().split('');
    //filter the list of hints according to the pressed key

    const filterHintsList = (letter, arr) =>
      arr.filter((word) => {
        word = word.toLowerCase();
        if (
          word[inputLetters.indexOf(letter)] === letter &&
          word[inputLetters.lastIndexOf(letter)] === letter
        ) {
          return word;
        }
      });

    //the corresponding list of hints
    const filteredHintsList = inputLetters.reduce((acc, letter) => {
      acc = filterHintsList(letter, acc);
      return acc;
    }, words);

    setInputs({
      ...inputs,
      [target.name]: { ...inputs[target.name], autocompleteOptions: filteredHintsList, value },
    });
  };

  const selectItem = (option, id) => (event) => {
    event.preventDefault();
    setInputs({ ...inputs, [id]: { ...inputs[id], value: option, status: 'filled' } });
  };

  const showOptions = (options, id) => {
    return (
      <div className="autocomplete-list">
        {options.map((option) => (
          <div
            key={_.uniqueId()}
            className={classNames('autocomplete-item', { filled: inputs[id].status === 'filled' })}
            onClick={selectItem(option, id)}
          >
            {option}
          </div>
        ))}
      </div>
    );
  };

  const makeField = () => {
    const inputsList = Object.entries(inputs);
    console.log(inputs);

    return inputsList.map(([, { id, autocompleteOptions, value }]) => (
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
              className="autocomplete-input"
              ref={fieldRef}
              value={value}
              onChange={changeHandler}
              autoFocus={id === '1' ? true : false}
            />
            {autocompleteOptions.length !== 0 ? showOptions(autocompleteOptions, id) : null}
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
