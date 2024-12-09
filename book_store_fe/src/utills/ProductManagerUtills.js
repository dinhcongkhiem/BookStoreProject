const getYearsFromCurrentTo1900 = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
        years.push(year);
    }
    return years;
};
const statusData = [
    { code: 0, label: 'Còn hàng' },
    { code: 1, label: 'Hết hàng' },
    { code: 2, label: 'Ngừng bán' },
];
const corverTypeData =  [
  { code: 0, label: 'Bìa cứng' },
  { code: 1, label: 'Bìa mềm' },
];;
const yearOfPublicationData = getYearsFromCurrentTo1900();

export { statusData, corverTypeData, yearOfPublicationData };
