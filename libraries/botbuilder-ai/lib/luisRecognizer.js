"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const LuisClient = require("botframework-luis");
class LuisRecognizer extends botbuilder_1.Recognizer {
    constructor(appId, subscriptionKey, baseUri) {
        super();
        this.appId = appId;
        this.subscriptionKey = subscriptionKey;
        let $this = this;
        this.luisClient = new LuisClient(baseUri);
        this.onRecognize((context) => {
            const utterance = (context.request.text || '').trim();
            return $this.recognizeAndMap(utterance, appId, subscriptionKey, true);
        });
    }
    static recognize(utterance, appId, subscriptionKey, baseUri) {
        let recognizer = new LuisRecognizer(appId, subscriptionKey);
        return recognizer.recognizeAndMap(utterance, appId, subscriptionKey, true);
    }
    recognizeAndMap(utterance, appId, subscriptionKey, verbose) {
        let $this = this;
        return this.luisClient.getIntentsAndEntitiesV2(appId, subscriptionKey, utterance)
            .then((result) => {
            let recognizerResult = {
                text: result.query,
                intents: {},
                entities: {}
            };
            if (verbose)
                recognizerResult.$instance = {};
            $this.populateIntents(result.topScoringIntent || { intent: '', score: 0.0 }, recognizerResult);
            $this.populateEntities(result.entities, result.compositeEntities || [], recognizerResult, verbose);
            return recognizerResult;
        });
    }
    populateIntents(intent, recognizerResult) {
        recognizerResult.intents[intent.intent || ''] = intent.score;
    }
    populateEntities(entities, compositeEntities, recognizerResult, verbose) {
        let $this = this;
        if (verbose)
            recognizerResult.$instance.entities = {};
        let compositeEntityTypes = compositeEntities.map(compositeEntity => compositeEntity.parentType);
        entities.forEach(entity => {
            if (compositeEntityTypes.indexOf(entity.type) > -1)
                return;
            if (entity.type.startsWith("builtin")) {
                $this.populatePrebuiltEntity(entity, recognizerResult, verbose);
            }
            else {
                $this.populateSimpleEntity(entity, recognizerResult, verbose);
            }
        });
        compositeEntities.forEach(compositeEntity => {
            $this.populateCompositeEntity(compositeEntity, recognizerResult, verbose);
        });
    }
    populateSimpleEntity(entity, recognizerResult, verbose) {
        this.addProperty(recognizerResult.entities, entity.type, entity.entity);
        if (verbose) {
            this.addProperty(recognizerResult.$instance.entities, entity.type, {
                startIndex: entity.startIndex,
                endIndex: entity.endIndex,
                score: entity.score
            });
        }
    }
    populatePrebuiltEntity(entity, recognizerResult, verbose) {
        if (entity.type === "builtin.datetimeV2.date") {
            let value = entity.resolution && entity.resolution.values && entity.resolution.values.length ?
                entity.resolution.values[0].timex :
                entity.resolution;
            this.addProperty(recognizerResult.entities, entity.type, value);
        }
        else {
            let resolution = entity.resolution || {};
            let value = Object.keys(resolution).length > 1 ? resolution : resolution.value;
            this.addProperty(recognizerResult.entities, entity.type, value);
        }
        if (verbose) {
            this.addProperty(recognizerResult.$instance.entities, entity.type, {
                startIndex: entity.startIndex,
                endIndex: entity.endIndex,
                resolution: entity.resolution,
                entity: entity.entity
            });
        }
    }
    populateCompositeEntity(compositeEntity, recognizerResult, verbose) {
        console.log('COMPOSITE');
    }
    /**
     * If a property doesn't exist add it as a singleton. If it does convert the property to an
     * array and append the new property value, creating the array if needed.
     * @param obj Object on which the property is to be set
     * @param key Property Key
     * @param value Property Value
     */
    addProperty(obj, key, value) {
        if (key in obj && Array.isArray(obj[key]))
            obj[key].push(value);
        else if (key in obj)
            obj[key] = [obj[key], value];
        else
            obj[key] = value;
    }
}
exports.LuisRecognizer = LuisRecognizer;
//# sourceMappingURL=luisRecognizer.js.map