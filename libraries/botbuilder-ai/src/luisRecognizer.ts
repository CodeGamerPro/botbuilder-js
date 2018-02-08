/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Recognizer, RecognizerResult } from 'botbuilder';
import LuisClient = require('botframework-luis');
import { LuisResult, Intent, Entity, CompositeEntity } from 'botframework-luis/lib/models';

export class LuisRecognizer extends Recognizer {
    private luisClient: LuisClient;

    constructor(private appId: string, private subscriptionKey: string, baseUri?: string) {
        super();
        let $this = this;
        this.luisClient = new LuisClient(baseUri);
        this.onRecognize((context) => {
            const utterance = (context.request.text || '').trim();
            return $this.recognizeAndMap(utterance, appId, subscriptionKey, true);
        });
    }

    public static recognize(utterance: string, appId: string, subscriptionKey: string, baseUri?: string): Promise<RecognizerResult> {
        let recognizer = new LuisRecognizer(appId, subscriptionKey);
        return recognizer.recognizeAndMap(utterance, appId, subscriptionKey, true);
    }

    protected recognizeAndMap(utterance: string, appId: string, subscriptionKey: string, verbose: boolean): Promise<RecognizerResult> {
        let $this = this;
        return this.luisClient.getIntentsAndEntitiesV2(appId, subscriptionKey, utterance)
            .then((result : LuisResult) => {
                let recognizerResult  : RecognizerResult = {
                    text: result.query,
                    intents: {},
                    entities: {}
                };
                if(verbose)
                    recognizerResult.$instance = {};
                
                $this.populateIntents(result.topScoringIntent || {intent: '', score: 0.0}, recognizerResult);
                $this.populateEntities(result.entities, result.compositeEntities || [], recognizerResult, verbose);
                return recognizerResult;
            });
    }

    private populateIntents(intent: Intent, recognizerResult: RecognizerResult) : void {
        recognizerResult.intents[intent.intent || ''] = intent.score;
    }

    private populateEntities(entities: Entity[], compositeEntities : CompositeEntity[], recognizerResult: RecognizerResult, verbose: boolean) : void {
        let $this = this;

        if(verbose)
            recognizerResult.$instance.entities = {};

        let compositeEntityTypes : string[] = compositeEntities.map(compositeEntity => compositeEntity.parentType);
        entities.forEach(entity => {
            if(compositeEntityTypes.indexOf(entity.type) > -1)
                return;

            if(entity.type.startsWith("builtin")){
                $this.populatePrebuiltEntity(entity, recognizerResult, verbose);
            }
            else{
                $this.populateSimpleEntity(entity, recognizerResult, verbose);
            }
        });

        compositeEntities.forEach(compositeEntity => {
            $this.populateCompositeEntity(compositeEntity, entities, recognizerResult, verbose);
        });
    }

    private populateSimpleEntity(entity: Entity, recognizerResult: RecognizerResult, verbose: boolean) : void {
        this.addProperty(recognizerResult.entities, entity.type, entity.entity);
        if(verbose){
            this.addProperty(recognizerResult.$instance.entities, entity.type, {
                startIndex: entity.startIndex,
                endIndex: entity.endIndex,
                score: entity.score
            });
        }
    }


    private populatePrebuiltEntity(entity: Entity, recognizerResult: RecognizerResult, verbose: boolean) : void {
        if(entity.type === "builtin.datetimeV2.date"){
            let value: any = entity.resolution && entity.resolution.values && entity.resolution.values.length ? 
                                entity.resolution.values[0].timex : 
                                entity.resolution;
            this.addProperty(recognizerResult.entities, entity.type, value);
        }
        else{
            let resolution: any = entity.resolution || {};
            let value: any = Object.keys(resolution).length > 1 ? resolution : resolution.value;
            this.addProperty(recognizerResult.entities, entity.type, value);
        }

        if(verbose){
            this.addProperty(recognizerResult.$instance.entities, entity.type, {
                startIndex: entity.startIndex,
                endIndex: entity.endIndex,
                resolution: entity.resolution,
                entity: entity.entity
            });
        }
    }

    private populateCompositeEntity(compositeEntity: CompositeEntity, entities: Entity[], recognizerResult: RecognizerResult, verbose: boolean) : void {
        var childrenEntites : object = {};

        // This is now implemented as O(n*k) search and can be reduced to O(n + k) using a map as an optimization if n or k grow
        compositeEntity.children.forEach(childEntity => {
            entities.forEach(entity =>{
                //if(entity.type === childEntity.type && entity.startIndex > compositeEntity.)
            });
        });
    }

    /**
     * If a property doesn't exist add it as a singleton. If it does convert the property to an
     * array and append the new property value, creating the array if needed.
     * @param obj Object on which the property is to be set
     * @param key Property Key
     * @param value Property Value
     */
    private addProperty(obj: any, key: string, value: any){
        if(key in obj && Array.isArray(obj[key]))
            obj[key].push(value);
        else if(key in obj)
            obj[key] = [obj[key], value];
        else
            obj[key] = value;
    }
}

