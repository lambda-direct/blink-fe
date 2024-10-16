import dayjs, { type ManipulateType } from 'dayjs';

const dayJsInstance = dayjs;

function getDayJsInstance(dateValue: dayjs.ConfigType) {
	return dayJsInstance(dateValue).isValid() ? dayJsInstance(dateValue) : dayJsInstance();
}

function formatDate(dateValue: dayjs.ConfigType, formatValue: string) {
	return getDayJsInstance(dateValue).format(formatValue);
}

function getAddedValueOfDate(
	dateValue: dayjs.ConfigType,
	counter: number,
	measurement: ManipulateType
) {
	return getDayJsInstance(dateValue).add(counter, measurement);
}

function getSubtractValueOfDate(
	dateValue: dayjs.ConfigType,
	counter: number,
	measurement: ManipulateType
) {
	return getDayJsInstance(dateValue).subtract(counter, measurement);
}

function getStartOfDateValue(dateValue: dayjs.ConfigType, measurement: ManipulateType = 'day') {
	return getDayJsInstance(dateValue).startOf(measurement);
}

function getEndOfDateValue(dateValue: dayjs.ConfigType, measurement: ManipulateType = 'day') {
	return getDayJsInstance(dateValue).endOf(measurement);
}

function isBeforeDateValue(
	startDateValue: dayjs.ConfigType,
	endDateValue: dayjs.ConfigType,
	measurement: ManipulateType = 'millisecond'
) {
	return getDayJsInstance(startDateValue).isBefore(getDayJsInstance(endDateValue), measurement);
}

function getDifferenceOfDates(
	startDateValue: dayjs.ConfigType,
	endDateValue: dayjs.ConfigType,
	measurement: ManipulateType = 'millisecond'
) {
	return getDayJsInstance(startDateValue).diff(getDayJsInstance(endDateValue), measurement);
}

function getUnixTimestamp(dateValue: dayjs.ConfigType) {
	return getDayJsInstance(dateValue).valueOf();
}

export {
	formatDate,
	getDayJsInstance,
	getUnixTimestamp,
	isBeforeDateValue,
	getEndOfDateValue,
	getAddedValueOfDate,
	getStartOfDateValue,
	getDifferenceOfDates,
	getSubtractValueOfDate
};
