/* eslint consistent-return: off */
import options from '../../data/words.json';

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

  const filterLeftRightOptions = (low, high) => {
    const midWordIndex = Math.floor((low + high) / 2);
    const midWordSubstring = sortedOptions[midWordIndex]
      .slice(0, inputLetters.length)
      .toLowerCase();
    if (midWordIndex === 0 || midWordIndex >= options.length) {
      return midWordIndex;
    }
    return [midWordIndex, midWordSubstring];
  };

  const filterLeftOptions = () => {
    let low = 0;
    let high = midWord;

    if (midWord === 0 || !midWord) {
      return midWord;
    }

    const previousSubstring = sortedOptions[midWord - 1]
      .slice(0, inputLetters.length)
      .toLowerCase();

    if (previousSubstring !== inputLetters) return midWord;

    while (low <= high) {
      const [midWordIndex, midWordSubstring] = filterLeftRightOptions(low, high);

      const previous = sortedOptions[midWordIndex - 1].slice(0, inputLetters.length).toLowerCase();

      if (midWordSubstring === inputLetters && previous !== inputLetters) {
        return midWordIndex;
      }
      if (midWordSubstring === inputLetters) {
        high = midWordIndex;
      }
      if (midWordSubstring < inputLetters) {
        low = midWordIndex;
      }
    }
  };

  const filterRightOptions = () => {
    let low = midWord;
    let high = options.length - 1;

    if (midWord >= options.length - 1 || !midWord) {
      return midWord;
    }

    const nextSubstring = sortedOptions[midWord + 1].slice(0, inputLetters.length).toLowerCase();

    if (nextSubstring !== inputLetters) return midWord;

    while (low <= high) {
      const [midWordIndex, midWordSubstring] = filterLeftRightOptions(low, high);

      const next = sortedOptions[midWordIndex + 1].slice(0, inputLetters.length).toLowerCase();

      if (midWordSubstring === inputLetters && next !== inputLetters) {
        return midWordIndex;
      }
      if (midWordSubstring === inputLetters) {
        low = midWordIndex;
      }
      if (midWordSubstring > inputLetters) {
        high = midWordIndex;
      }
    }
  };

  const filteredHintsList = sortedOptions.slice(filterLeftOptions(), filterRightOptions() + 1);
  return filteredHintsList;
};

export default filterWords;
