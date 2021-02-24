const randomNumberForEachDay = () => {
    const startDate = "2020-01-01"
    const diffInMilliSec = new Date() - new Date(startDate)
    const diffInDays = parseInt(diffInMilliSec / (1000 * 60 * 60 * 24)) % 100
    return diffInDays
}

export default randomNumberForEachDay