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
        var context = { request: { text: 'I want to travel on United' } };
        recognizer.recognize(context).then(res => {
                assert(res);
                assert(res.length === 1);
                assert(res[0].intents);
                assert(res[0].intents.Travel);
                assert(res[0].intents.Travel > 0 && res[0].intents.Travel <= 1);
                assert(res[0].entities);
                assert(res[0].entities.Airline);
                assert(res[0].entities.Airline === 'United');
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
                done();
            });
    });

    it('should return an intent and a composite entity', function(done){
        done();
    });
  
})
