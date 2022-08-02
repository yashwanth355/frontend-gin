export default class Utility {
    static handleChange(data, key, value, setData = null, type = "text") {
        let temporaryValue = value;
        switch (type) {
            case "number":
                temporaryValue = value >= 0 ? value : 0
                break;
            case "date":
            case "text":
                break;
            default:
                break;

        }
        if (setData) setData({ ...data, [key]: temporaryValue })
        else return { ...data, [key]: temporaryValue }
    }
    static convertToPositive(number) {
        let type = typeof number;
        switch (type) {
            case "string":
                return parseFloat(number) >= 0 ? String(+parseFloat(number)) : "0"
            default:
                return parseFloat(number) >= 0 ? +parseFloat(number) : 0
        }
    }
}