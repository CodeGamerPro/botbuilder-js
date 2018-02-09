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
            return $this.recognizeAndMap(utterance, appId, subscriptionKey, true).then(res => {
                let recognizerResults = [res];
                return recognizerResults;
            });
        });
    }
    static recognize(utterance, appId, subscriptionKey, baseUri) {
        let recognizer = new LuisRecognizer(appId, subscriptionKey, baseUri);
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
            // we'll address composite entities separately
            if (compositeEntityTypes.indexOf(entity.type) > -1)
                return;
            if (entity.type.startsWith("builtin.")) {
                $this.populatePrebuiltEntity(entity, recognizerResult, verbose);
            }
            else {
                $this.populateSimpleEntity(entity, recognizerResult, verbose);
            }
        });
        compositeEntities.forEach(compositeEntity => {
            $this.populateCompositeEntity(compositeEntity, entities, recognizerResult, verbose);
        });
    }
    computeSimpleEntity(entity) {
        return {
            key: entity.type,
            value: entity.entity
        };
    }
    computeSimpleEntityMetadata(entity) {
        return {
            key: entity.type,
            value: {
                startIndex: entity.startIndex,
                endIndex: entity.endIndex,
                score: entity.score
            }
        };
    }
    populateSimpleEntity(entity, recognizerResult, verbose) {
        let simpleEntity = this.computeSimpleEntity(entity);
        this.addProperty(recognizerResult.entities, simpleEntity.key, simpleEntity.value);
        if (verbose) {
            let simpleEntityMetadata = this.computeSimpleEntityMetadata(entity);
            this.addProperty(recognizerResult.$instance.entities, simpleEntityMetadata.key, simpleEntityMetadata.value);
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
    populateCompositeEntity(compositeEntity, entities, recognizerResult, verbose) {
        let childrenEntites = {};
        let $this = this;
        // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
        let compositeEntityMetadata;
        entities.some(entity => {
            // For now we are matching by value, which can be ambiguous if the same composite entity shows up with the same text 
            // multiple times within an utterance, but this is just a stop gap solution till the indices are included in composite entities
            if (entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value) {
                compositeEntityMetadata = entity;
                return true;
            }
            return false;
        });
        // This is an error case and should not happen in theory
        if (!compositeEntityMetadata)
            return;
        // This is now implemented as O(n*k) search and can be reduced to O(n + k) using a map as an optimization if n or k grow
        compositeEntity.children.forEach(childEntity => {
            entities.forEach(entity => {
                if (childEntity.type === entity.type &&
                    compositeEntityMetadata &&
                    entity.startIndex && compositeEntityMetadata.startIndex && entity.startIndex >= compositeEntityMetadata.startIndex &&
                    entity.endIndex && compositeEntityMetadata.endIndex && entity.endIndex <= compositeEntityMetadata.endIndex) {
                    let simpleEntity = $this.computeSimpleEntity(entity);
                    $this.addProperty(childrenEntites, simpleEntity.key, simpleEntity.value);
                }
            });
        });
        this.addProperty(recognizerResult.entities, compositeEntity.parentType, childrenEntites);
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