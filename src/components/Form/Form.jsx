/* eslint consistent-return: off */

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
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
  const [formState, setFormState] = useState('');
  const [submitBtnDisable, setSubmitBtnDisable] = useState(true);
  const [confirmBtnDisable, setConfirmBtnDisable] = useState(true);
  const [activeField, setActiveField] = useState('1');
  const [submitFormData, setSubmitFormData] = useState('');
  const [focusedOption, setFocusedOption] = useState(0);
  const [coords, setCoords] = useState(0);
  const [wrongWords, setWrongWords] = useState({});

  const unfocusAllItems = () => {
    if (formState === 'unconfirmed') {
      setFormState('disable unconfirmed');
    } else {
      setFormState('disable');
    }
    setFocusedOption(0);
    setCoords(0);
    fieldRefs.current[activeField - 1].current.blur();
  };

  const sortOptions = (givenInputs) => {
    const autocompleteOptions = options.sort((a, b) => a.localeCompare(b));
    const sortedOptions = Object.entries(givenInputs).map(([key, value]) => [
      key,
      { ...value, autocompleteOptions },
    ]);
    return Object.fromEntries(sortedOptions);
  };

  const submitForm = () => {
    setInputs(sortOptions(fields));
    setFormState('submitted');
    setSubmitBtnDisable(true);
    setActiveField('1');
    setConfirmBtnDisable(true);
    fieldRefs.current[0].current.focus();
  };

  useLayoutEffect(() => {
    setInputs(sortOptions(inputs));
  }, []);

  useEffect(() => {
    fieldRefs.current[0].current.focus();
    const disableClick = (e) => {
      const field = 'autocomplete-input';
      if (field !== e.target.classList[0] || !e.target.classList[0]) {
        e.preventDefault();
      }
    };
    document.body.addEventListener('mousedown', disableClick);
  }, []);

  useEffect(() => {
    if (inputs[activeField].status === 'filling') {
      const list = document.querySelector('.autocomplete-list');
      list.scrollTo(0, coords);
    }
    const filledFealds = Object.values(inputs).filter(
      ({ status }) => status === 'filled' || status === 'unconfirmed filled'
    );
    setSubmitBtnDisable(filledFealds.length !== fieldRefs.current.length);
    setConfirmBtnDisable(filledFealds.length !== fieldRefs.current.length);
    if (filledFealds.length === fieldRefs.current.length) {
      unfocusAllItems();
      if (formState === 'unconfirmed') setFormState('unconfirmed');
      else setFormState('filled');
      return submitFormData === '' ? copyBtnRef.current.focus() : confirmBtnRef.current.focus();
    }
  }, [inputs, submitFormData, confirmBtnDisable, coords]);

  const getNearestUnfilledField = (inputFields = inputs) => {
    const nearstUnfilledField = Object.values(inputFields).filter(
      ({ status, id }) =>
        status !== 'filled' && status !== 'unconfirmed filled' && id !== activeField
    );
    if (nearstUnfilledField.length === 0) return;
    const [first] = nearstUnfilledField;
    return first.id;
  };

  const selectItem = (option, id) => {
    const nearstUnfilledField = getNearestUnfilledField();
    setFocusedOption(0);
    setCoords(0);
    if (nearstUnfilledField) {
      fieldRefs.current[nearstUnfilledField - 1].current.focus();
      setActiveField(nearstUnfilledField);
    }

    let status;

    if (_.has(wrongWords, id) && wrongWords[id] === option) {
      status = 'unconfirmed word';
    } else if (formState === 'unconfirmed') {
      status = 'unconfirmed filled';
    } else if (formState !== 'unconfirmed') {
      status = 'filled';
    }

    setInputs({
      ...inputs,
      [id]: {
        ...inputs[id],
        value: option,
        autocompleteOptions: [],
        status,
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
    setFocusedOption(0);
    setCoords(0);
    setTimeout(() => {
      copyBtnRef.current.innerHTML = 'Copy';
      const nearstUnfilledField = getNearestUnfilledField();
      if (!nearstUnfilledField) {
        submitBtnRef.current.focus();
        return;
      }
      setFormState('copied');
      fieldRefs.current[activeField - 1].current.focus();
    }, 500);
  };

  const clickHandler = (event) => {
    event.preventDefault();
    const { target } = event;
    const { textContent, dataset, classList } = target;

    const makeConfirmation = () => {
      const getInputValues = (data) => {
        const inputValues = Object.values(data).map(({ value }) => value);
        return inputValues.join('');
      };

      const findWrongWords = () => {
        setFormState('unconfirmed');
        const wrongWordsId = [];
        let wrongW = {};

        let id = 1;
        while (id <= fieldRefs.current.length) {
          if (submitFormData[`${id}`].value !== inputs[`${id}`].value) {
            wrongWordsId.push(`${id}`);
            wrongW = { ...wrongW, [id]: inputs[`${id}`].value };
          }
          id += 1;
        }
        setWrongWords(wrongW);

        const findCorrectWords = () => {
          const wordsIds = Object.keys(inputs);
          return _.xor(wrongWordsId, wordsIds);
        };

        const correctWordsObj = findCorrectWords().reduce(
          (acc, correctWordId) => ({
            ...acc,
            [correctWordId]: { ...inputs[correctWordId], status: 'filled' },
          }),
          {}
        );

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
          confirmButtonColor: 'rgba(127, 255, 212, 0.6)',
          didClose: () => {
            setActiveField(wrongWordsId[0]);
            fieldRefs.current[wrongWordsId[0] - 1].current.focus();
            setInputs({
              ...correctWordsObj,
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
    };

    const classname = classList.value.split(' ')[0];

    if (!_.has(classes, classname)) {
      return;
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
                  coords={coords}
                  focusedOption={focusedOption}
                  setFocusedOption={setFocusedOption}
                  setCoords={setCoords}
                  submitData={submitFormData}
                  wrongWords={wrongWords}
                  setWrongWords={setWrongWords}
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
