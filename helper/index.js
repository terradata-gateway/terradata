class Helper {
    constructor() {

    }

    reqToEvent(req) {
        let event = {};
        event.headers = req.headers;
        event.body = req.body;

        return event;
    }
}

module.exports = Helper;