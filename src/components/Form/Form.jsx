/* eslint consistent-return: off */

import React, { useState, useRef, useEffect } from 'react';
import './Form.css';
import classNames from 'classnames';
import Swal from 'sweetalert2';
import _ from 'lodash';
import fields from '../../data/fields.json';
import options from '../../data/words.json';
import Field from '../Field/Field';

function Form() {
  const fieldRefs = useRef([]);
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

  const unfocusAllItems = () => {
    setFormState('disable');
  };

  const submitForm = () => {
    setInputs(fields);
    setFormState('submitted');
    setSubmitBtnDisable(true);
    setActiveField('1');
    setConfirmBtnDisable(true);
  };

  useEffect(() => {
    const filledFealds = Object.values(inputs).filter(({ status }) => status === 'filled');
    setSubmitBtnDisable(filledFealds.length !== fieldRefs.current.length);
    setConfirmBtnDisable(filledFealds.length !== fieldRefs.current.length);
    if (filledFealds.length === fieldRefs.current.length) {
      unfocusAllItems();
      setFormState('filled');
      return submitFormData === '' ? copyBtnRef.current.focus() : confirmBtnRef.current.focus();
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

  const clickHandler = (event) => {
    event.preventDefault();
    const { target } = event;
    const { name, textContent, dataset, classList, value } = target;

    const makeConfirmation = () => {
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

        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Mistake! Try again!',
          confirmButtonColor: 'rgba(127, 255, 212, 0.4)',
          didClose: () => {
            setActiveField(wrongWordsId[0]);
            setInputs({
              ...inputs,
              ...wrongWordsObj,
            });
          },
        });
      };

      const submitData = getInputValues(submitFormData);
      const confirmData = getInputValues(inputs);
      return submitData === confirmData ? setFormState('confirmed') : findWrongWords();
    };

    const classes = {
      submit: () => {
        setSubmitFormData(inputs);
        submitForm();
      },
      confirm: () => makeConfirmation(),
      'autocomplete-item': () => selectItem(textContent, dataset.input),
      copy: () => copy(),
      'autocomplete-input': () => {
        setActiveField(name);
        setFormState('updated');

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
      },
    };

    const classname = classList.value.split(' ')[0];

    if (!_.has(classes, classname)) {
      return unfocusAllItems();
    }

    return classes[classname]();
  };

  return (
    <div
      className={classNames('wrapper', { disabledbutton: formState === 'confirmed' })}
      onClick={clickHandler}
      role="presentation"
    >
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
        <form ref={formRef} className="input__wrap">
          <table>
            <tbody>
              <tr className="row">
                <Field
                  selectItem={selectItem}
                  formState={formState}
                  setFormState={setFormState}
                  getNearestUnfilledField={getNearestUnfilledField}
                  activeField={activeField}
                  setActiveField={setActiveField}
                  setInputs={setInputs}
                  inputs={inputs}
                  unfocusAllItems={unfocusAllItems}
                  ref={fieldRefs}
                />
              </tr>
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
