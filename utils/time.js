export function toISOStringWithTimezone(date) {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')
    const seconds = `${date.getSeconds()}`.padStart(2, '0')
    const ms = `${date.getMilliseconds()}`.padStart(3, '0')

    const offsetHours = `${date.getTimezoneOffset() / -60}`.padStart(2, '0')
    const timezonePostfix = offsetHours === 0 ? 'Z' : `+${offsetHours}:00`

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${timezonePostfix}`
}
