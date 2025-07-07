// Dictionary utility functions
export const dictFilter = (dictData, code) => {
  const values = dictData.filter(item => item.code === code);
  return values.length > 0 ? values[0].value : '';
};

export const dictOptions = (dictData) => {
  return dictData.map(item => ({
    label: item.value,
    value: item.code
  }));
};

export default {
  dictFilter,
  dictOptions
}; 