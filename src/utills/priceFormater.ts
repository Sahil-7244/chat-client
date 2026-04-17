export const formatIndianNumber = (num:number) => {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(2).replace(/\.00$/, "") + " Crore";
  } 
  else if (num >= 100000) {
    return (num / 100000).toFixed(2).replace(/\.00$/, "") + " Lakh";
  } 
  else {
    return num.toLocaleString("en-IN");
  }
};