/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Recognizer, RecognizerResult } from 'botbuilder';
export declare class LuisRecognizer extends Recognizer {
    private appId;
    private subscriptionKey;
    private luisClient;
    constructor(appId: string, subscriptionKey: string, baseUri?: string);
    static recognize(utterance: string, appId: string, subscriptionKey: string, baseUri?: string): Promise<RecognizerResult>;
    protected recognizeAndMap(utterance: string, appId: string, subscriptionKey: string, verbose: boolean): Promise<RecognizerResult>;
    private populateIntents(intent, recognizerResult);
    private populateEntities(entities, compositeEntities, recognizerResult, verbose);
    private computeEntityValue(entity);
    private computeEntityMetadata(entity);
    private populateCompositeEntity(compositeEntity, entities, recognizerResult, verbose);
    /**
     * If a property doesn't exist add it as a singleton. If it does convert the property to an
     * array and append the new property value, creating the array if needed.
     * @param obj Object on which the property is to be set
     * @param key Property Key
     * @param value Property Value
     */
    private addProperty(obj, key, value);
}
