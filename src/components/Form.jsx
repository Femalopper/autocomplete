import React, { useState } from 'react';
import './Form.css';

const Form = () => {
  const fieldRef = React.createRef();
  const [fieldValues, setFieldValues] = useState({ inputValues: {} });

  const changeHandler = (event) => {
    event.preventDefault();
    setFieldValues({
      inputValues: { ...fieldValues.inputValues, [event.target.name]: event.target.value },
    });
  };

  const makeField = () => {
    let numOfFields = 33;
    let currentFieldNumber = 1;
    const listOfFields = [];
    while (numOfFields > 0) {
      listOfFields.push(
        <td key={currentFieldNumber}>
          <div className="input__field">
            <span className="number">{currentFieldNumber}</span>
            <input
              type="text"
              id="autocomplete"
              autoComplete="off"
              tabIndex={currentFieldNumber}
              name={currentFieldNumber}
              ref={fieldRef}
              onChange={changeHandler}
            />
          </div>
        </td>
      );
      numOfFields -= 1;
      currentFieldNumber += 1;
    }
    return listOfFields;
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
