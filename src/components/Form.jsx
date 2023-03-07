import React from 'react';

const Form = () => {
  const makeField = () => {
    let numOfFields = 33;
    let currentFieldNumber = 1;
    const listOfFields = [];
    while (numOfFields > 0) {
      listOfFields.push(
        <td>
          <div className="input__field">
            <span className="number">{currentFieldNumber}</span>
            <input type="text" id="autocomplete" autocomplete="off" tabindex={currentFieldNumber} />
          </div>
        </td>
      );
      numOfFields -= 1;
      currentFieldNumber += 1;
    }
    return listOfFields;
  };

  return (
    <main id="page1" class="main">
      <h4>Enter your seed phrase</h4>
      <article class="input__wrap">
        <table>
          <tbody>
            <tr class="row">{makeField()}</tr>
            <tr class="row">
              <td>
                <button id="copy__button" class="submit">
                  Copy
                </button>
              </td>
              <td id="buttn">
                <button id="submit__button" class="submit">
                  Submit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </main>
  );
};

export default Form;
