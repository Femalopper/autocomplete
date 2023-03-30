/* eslint consistent-return: off */

const filterWords = (value, options) => {
  const inputLetters = value.toLowerCase();

  // filter the list of hints according to the pressed key
  const findRandomFirstSimilarSbstrIndex = () => {
    let low = 0;
    let high = options.length - 1;

    while (low <= high) {
      const midWordIndex = Math.floor((low + high) / 2);
      const midWordSubstring = options[midWordIndex].slice(0, inputLetters.length).toLowerCase();
      if (midWordSubstring === inputLetters) {
        return midWordIndex;
      }
      if (midWordSubstring < inputLetters) {
        low = midWordIndex + 1;
      } else {
        high = midWordIndex - 1;
      }
    }
  };

  const randomFirstSimilarSbstrIndex = findRandomFirstSimilarSbstrIndex();

  const findSimilarSbstrIndex = (low, high, feature) => {
    while (low <= high) {
      const midWordIndex = Math.floor((low + high) / 2);
      const midWordSubstring = options[midWordIndex].slice(0, inputLetters.length).toLowerCase();
      if (midWordIndex === 0 || midWordIndex >= options.length) {
        return midWordIndex;
      }
      const previousSubstring = options[midWordIndex - 1]
        .slice(0, inputLetters.length)
        .toLowerCase();
      const nextSubstring = options[midWordIndex + 1].slice(0, inputLetters.length).toLowerCase();
      if (
        (previousSubstring !== inputLetters || nextSubstring !== inputLetters) &&
        midWordSubstring === inputLetters
      ) {
        return midWordIndex;
      }
      if (
        (feature === 'left' && midWordSubstring === inputLetters) ||
        (feature === 'right' && midWordSubstring > inputLetters)
      ) {
        high = midWordIndex;
      } else {
        low = midWordIndex;
      }
    }
  };

  const findSimilarSbstrLeftIndex = () => {
    const low = 0;
    const high = randomFirstSimilarSbstrIndex;

    if (randomFirstSimilarSbstrIndex === 0 || !randomFirstSimilarSbstrIndex) {
      return randomFirstSimilarSbstrIndex;
    }

    const previousSubstring = options[randomFirstSimilarSbstrIndex - 1]
      .slice(0, inputLetters.length)
      .toLowerCase();

    if (previousSubstring !== inputLetters) return randomFirstSimilarSbstrIndex;
    return findSimilarSbstrIndex(low, high, 'left');
  };

  const findSimilarSbstrRightIndex = () => {
    const low = randomFirstSimilarSbstrIndex;
    const high = options.length - 1;

    if (randomFirstSimilarSbstrIndex >= options.length - 1 || !randomFirstSimilarSbstrIndex) {
      return randomFirstSimilarSbstrIndex;
    }

    const nextSubstring = options[randomFirstSimilarSbstrIndex + 1]
      .slice(0, inputLetters.length)
      .toLowerCase();
    if (nextSubstring !== inputLetters) return randomFirstSimilarSbstrIndex;

    return findSimilarSbstrIndex(low, high, 'right');
  };

  return options.slice(findSimilarSbstrLeftIndex(), findSimilarSbstrRightIndex() + 1);
};

export default filterWords;
