/* eslint consistent-return: off */
import options from '../../data/words.json';
import filterLeftRightOptions from './filterWords';

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

  const filterLeftOptions = () => {
    const low = 0;
    const high = midWord;

    if (midWord === 0 || !midWord) {
      return midWord;
    }

    const previousSubstring = sortedOptions[midWord - 1]
      .slice(0, inputLetters.length)
      .toLowerCase();

    if (previousSubstring !== inputLetters) return midWord;

    return filterLeftRightOptions(low, high, 'left', inputLetters, sortedOptions, options);
  };

  const filterRightOptions = () => {
    const low = midWord;
    const high = options.length - 1;

    if (midWord >= options.length - 1 || !midWord) {
      return midWord;
    }

    const nextSubstring = sortedOptions[midWord + 1].slice(0, inputLetters.length).toLowerCase();

    if (nextSubstring !== inputLetters) return midWord;

    return filterLeftRightOptions(low, high, 'right', inputLetters, sortedOptions, options);
  };

  const filteredHintsList = sortedOptions.slice(filterLeftOptions(), filterRightOptions() + 1);
  return filteredHintsList;
};

export default filterWords;
