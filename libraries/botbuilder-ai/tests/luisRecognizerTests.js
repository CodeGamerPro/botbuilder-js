const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');

const luisAppId = process.env.LUISAPPID;
const subscriptionKey = process.env.LUISAPPKEY;
const LuisBaseUri = "https://westus.api.cognitive.microsoft.com/luis";

describe('LuisRecognizer', function () {
    this.timeout(10000);
    
    if (!luisAppId) 
    {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPID environment variable is not defined');
        return;
    }
    if (!subscriptionKey) 
    {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPKEY environment variable is not defined');
        return;
    }

    it('should return an intent and a simple entity', function(done){
        var recognizer = new ai.LuisRecognizer(luisAppId, subscriptionKey, LuisBaseUri);
        var context = { request: { text: 'My name is Emad' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].intents);
                assert(res[0].intents.SpecifyName);
                assert(res[0].intents.SpecifyName > 0 && res[0].intents.SpecifyName <= 1);
                assert(res[0].entities);
                assert(res[0].entities.Name);
                assert(res[0].entities.Name === 'emad');
                assert(res[0].$instance);
                assert(res[0].$instance.entities);
                assert(res[0].$instance.entities.Name);
                assert(res[0].$instance.entities.Name.startIndex === 11);
                assert(res[0].$instance.entities.Name.endIndex === 14);
                assert(res[0].$instance.entities.Name.score > 0 && res[0].$instance.entities.Name.score <= 1);
                done();
            });
    });

    it('should return an intent and prebuilt entities with a single value', function(done){
        var recognizer = new ai.LuisRecognizer(luisAppId, subscriptionKey, LuisBaseUri);
        var context = { request: { text: 'Please deliver February 2nd 2001' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].intents);
                assert(res[0].intents.Delivery);
                assert(res[0].intents.Delivery > 0 && res[0].intents.Delivery <= 1);
                assert(res[0].entities);
                assert(res[0].entities['builtin.number']);
                assert(res[0].entities['builtin.number'] === '2001');
                assert(res[0].entities['builtin.datetimeV2.date']);
                assert(res[0].entities['builtin.datetimeV2.date'] === '2001-02-02');
                assert(res[0].$instance);
                assert(res[0].$instance.entities);
                assert(res[0].$instance.entities['builtin.number']);
                assert(res[0].$instance.entities['builtin.number'].startIndex === 28);
                assert(res[0].$instance.entities['builtin.number'].endIndex === 31);
                assert(res[0].$instance.entities['builtin.number'].value);
                assert(res[0].$instance.entities['builtin.number'].value === '2001');
                assert(res[0].$instance.entities['builtin.number'].entity);
                assert(res[0].$instance.entities['builtin.number'].entity === '2001');
                assert(res[0].$instance.entities['builtin.datetimeV2.date']);
                assert(res[0].$instance.entities['builtin.datetimeV2.date'].startIndex === 15);
                assert(res[0].$instance.entities['builtin.datetimeV2.date'].endIndex === 31);
                assert(res[0].$instance.entities['builtin.datetimeV2.date'].value);
                assert(res[0].$instance.entities['builtin.datetimeV2.date'].value.timex);
                assert(res[0].$instance.entities['builtin.datetimeV2.date'].entity);
                assert(res[0].$instance.entities['builtin.datetimeV2.date'].entity === 'february 2nd 2001');
                done();
            });
    });

    it('should return an intent and prebuilt entities with multiple values', function(done){
        var recognizer = new ai.LuisRecognizer(luisAppId, subscriptionKey, LuisBaseUri);
        var context = { request: { text: 'Please deliver February 2nd 2001 in room 201' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].intents);
                assert(res[0].intents.Delivery);
                assert(res[0].intents.Delivery > 0 && res[0].intents.Delivery <= 1);
                assert(res[0].entities);
                assert(res[0].entities['builtin.number']);
                assert(res[0].entities['builtin.number'].length == 2);
                assert(res[0].entities['builtin.number'].indexOf('2001') > -1);
                assert(res[0].entities['builtin.number'].indexOf('201') > -1);
                assert(res[0].entities['builtin.datetimeV2.date']);
                assert(res[0].entities['builtin.datetimeV2.date'] === '2001-02-02');
                done();
            });
    })

    it('should return an intent and a list entity with a single value', function(done){
        var recognizer = new ai.LuisRecognizer(luisAppId, subscriptionKey, LuisBaseUri);
        var context = { request: { text: 'I want to travel on united' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].intents);
                assert(res[0].intents.Travel);
                assert(res[0].intents.Travel > 0 && res[0].intents.Travel <= 1);
                assert(res[0].entities);
                assert(res[0].entities.Airline);
                assert(res[0].entities.Airline === 'United');
                assert(res[0].$instance);
                assert(res[0].$instance.entities);
                assert(res[0].$instance.entities.Airline);
                assert(res[0].$instance.entities.Airline.startIndex);
                assert(res[0].$instance.entities.Airline.startIndex === 20);
                assert(res[0].$instance.entities.Airline.endIndex);
                assert(res[0].$instance.entities.Airline.endIndex === 25);
                assert(res[0].$instance.entities.Airline.entity);
                assert(res[0].$instance.entities.Airline.entity === 'united');
                assert(res[0].$instance.entities.Airline.value);
                assert(res[0].$instance.entities.Airline.value === 'United');
                done();
            });
    });

    it('should return an intent and a list entity with multiple values', function(done){
        var recognizer = new ai.LuisRecognizer(luisAppId, subscriptionKey, LuisBaseUri);
        var context = { request: { text: 'I want to travel on DL' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].intents);
                assert(res[0].intents.Travel);
                assert(res[0].intents.Travel > 0 && res[0].intents.Travel <= 1);
                assert(res[0].entities);
                assert(res[0].entities.Airline);
                assert(res[0].entities.Airline.length == 2);
                assert(res[0].entities.Airline.indexOf('Delta') > -1);
                assert(res[0].entities.Airline.indexOf('Virgin') > -1);
                assert(res[0].$instance);
                assert(res[0].$instance.entities);
                assert(res[0].$instance.entities.Airline);
                assert(res[0].$instance.entities.Airline.startIndex);
                assert(res[0].$instance.entities.Airline.startIndex === 20);
                assert(res[0].$instance.entities.Airline.endIndex);
                assert(res[0].$instance.entities.Airline.endIndex === 21);
                assert(res[0].$instance.entities.Airline.entity);
                assert(res[0].$instance.entities.Airline.entity === 'dl');
                assert(res[0].$instance.entities.Airline.values);
                assert(res[0].$instance.entities.Airline.values.length === 2);
                assert(res[0].$instance.entities.Airline.values.indexOf('Delta') > -1);
                assert(res[0].$instance.entities.Airline.values.indexOf('Virgin') > -1);
                done();
            });
    });

    it('should return an intent and a single composite entity', function(done){
        var recognizer = new ai.LuisRecognizer(luisAppId, subscriptionKey, LuisBaseUri);
        var context = { request: { text: 'Please deliver it to 98033 WA' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].intents);
                assert(res[0].intents.Delivery);
                assert(res[0].intents.Delivery > 0 && res[0].intents.Delivery <= 1);
                assert(res[0].entities);
                assert(res[0].entities['builtin.number']);
                assert(res[0].entities['builtin.number'] === "98033");
                assert(res[0].entities.State);
                assert(res[0].entities.State === "wa");
                assert(res[0].entities.Address);
                assert(res[0].entities.Address['builtin.number'] === "98033");
                assert(res[0].entities.Address.State);
                assert(res[0].entities.Address.State === "wa");
                assert(res[0].$instance);
                assert(res[0].$instance.entities);
                assert(res[0].$instance.entities['builtin.number']);
                assert(res[0].$instance.entities['builtin.number'].startIndex);
                assert(res[0].$instance.entities['builtin.number'].startIndex === 21);
                assert(res[0].$instance.entities['builtin.number'].endIndex);
                assert(res[0].$instance.entities['builtin.number'].endIndex === 25);
                assert(res[0].$instance.entities['builtin.number'].entity);
                assert(res[0].$instance.entities['builtin.number'].entity === "98033");
                assert(res[0].$instance.entities['builtin.number'].value);
                assert(res[0].$instance.entities['builtin.number'].value === "98033");
                assert(res[0].$instance.entities.State);
                assert(res[0].$instance.entities.State.startIndex);
                assert(res[0].$instance.entities.State.startIndex === 27);
                assert(res[0].$instance.entities.State.endIndex);
                assert(res[0].$instance.entities.State.endIndex === 28);
                assert(res[0].$instance.entities.State.score);
                assert(res[0].$instance.entities.State.score > 0 && res[0].$instance.entities.State.score <= 1);
                assert(res[0].$instance.entities.Address);
                assert(res[0].$instance.entities.Address.startIndex);
                assert(res[0].$instance.entities.Address.startIndex === 21);
                assert(res[0].$instance.entities.Address.endIndex);
                assert(res[0].$instance.entities.Address.endIndex === 28);
                assert(res[0].$instance.entities.Address.score);
                assert(res[0].$instance.entities.Address.score > 0 && res[0].$instance.entities.State.score <= 1);
                assert(res[0].$instance.entities.Address['builtin.number']);
                assert(res[0].$instance.entities.Address['builtin.number'].startIndex);
                assert(res[0].$instance.entities.Address['builtin.number'].startIndex === 21);
                assert(res[0].$instance.entities.Address['builtin.number'].endIndex);
                assert(res[0].$instance.entities.Address['builtin.number'].endIndex === 25);
                assert(res[0].$instance.entities.Address['builtin.number'].entity);
                assert(res[0].$instance.entities.Address['builtin.number'].entity === "98033");
                assert(res[0].$instance.entities.Address['builtin.number'].value);
                assert(res[0].$instance.entities.Address['builtin.number'].value === "98033");
                assert(res[0].$instance.entities.Address.State);
                assert(res[0].$instance.entities.Address.State.startIndex);
                assert(res[0].$instance.entities.Address.State.startIndex === 27);
                assert(res[0].$instance.entities.Address.State.endIndex);
                assert(res[0].$instance.entities.Address.State.endIndex === 28);
                assert(res[0].$instance.entities.Address.State.score);
                assert(res[0].$instance.entities.Address.State.score > 0 && res[0].$instance.entities.Address.State.score <= 1);
                done();
            });
    });
  
});
