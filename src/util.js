
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


export const NON_EXISTENT_DOC_ID = 'NON_EXISTENT_DOC_ID';

export function formatDateStr(isoString) {

  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${monthNames[monthIndex]} ${year}`;
}
