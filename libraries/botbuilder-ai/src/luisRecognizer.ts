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
            return $this.recognizeAndMap(utterance, appId, subscriptionKey, true).then(res =>{
                let recognizerResults : RecognizerResult[]  = [res]
                return recognizerResults;
            });
        });
    }

    public static recognize(utterance: string, appId: string, subscriptionKey: string, baseUri?: string): Promise<RecognizerResult> {
        let recognizer = new LuisRecognizer(appId, subscriptionKey, baseUri);
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
            // we'll address composite entities separately
            if(compositeEntityTypes.indexOf(entity.type) > -1)
                return;

            let value = $this.computeEntityValue(entity);
            let metadata: any;

            if(entity.type.startsWith("builtin.")){
                metadata = $this.computeEntityMetadata(entity);
                
            }
            else{
                metadata = $this.computeSimpleEntityMetadata(entity);
            }

            this.addProperty(recognizerResult.entities, entity.type, value);
            if(verbose){
                this.addProperty(recognizerResult.$instance.entities, entity.type, metadata);
            }
        });

        compositeEntities.forEach(compositeEntity => {
            $this.populateCompositeEntity(compositeEntity, entities, recognizerResult, verbose);
        });
    }


    private computeSimpleEntityMetadata(entity: Entity) : any {
        return {
            startIndex: entity.startIndex,
            endIndex: entity.endIndex,
            score: entity.score
        };
    }

    private computeEntityValue(entity: Entity) : any {
        if(entity.type === "builtin.datetimeV2.date"){
            return entity.resolution && entity.resolution.values && entity.resolution.values.length ? 
                                entity.resolution.values[0].timex : 
                                entity.resolution;
           
        }
        else if(entity.resolution){
            return Object.keys(entity.resolution).length > 1 ? entity.resolution : 
                    entity.resolution.value ? entity.resolution.value : 
                        entity.resolution.values && entity.resolution.values.length == 1 ? entity.resolution.values[0] : entity.resolution.values;
        }
        else{
            return entity.entity;
        }
    }

    private computeEntityMetadata(entity: Entity) : any {
        return {
            startIndex: entity.startIndex,
            endIndex: entity.endIndex,
            value: entity.resolution ? entity.resolution.value || entity.resolution.values : {},
            entity: entity.entity
        };
    }

    private populateCompositeEntity(compositeEntity: CompositeEntity, entities: Entity[], recognizerResult: RecognizerResult, verbose: boolean) : void {
        let childrenEntites : any = {};
        let $this = this;
        
        // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
        let compositeEntityMetadata : Entity | undefined;
        entities.some(entity => {
            // For now we are matching by value, which can be ambiguous if the same composite entity shows up with the same text 
            // multiple times within an utterance, but this is just a stop gap solution till the indices are included in composite entities
            if(entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value){
                compositeEntityMetadata = entity;
                return true;
            }
            return false;
        });

        // This is an error case and should not happen in theory
        if(!compositeEntityMetadata)
            return;

        // This is now implemented as O(n*k) search and can be reduced to O(n + k) using a map as an optimization if n or k grow
        compositeEntity.children.forEach(childEntity => {
            entities.forEach(entity =>{
                if(childEntity.type === entity.type && 
                    compositeEntityMetadata && 
                    entity.startIndex && compositeEntityMetadata.startIndex && entity.startIndex >= compositeEntityMetadata.startIndex && 
                    entity.endIndex && compositeEntityMetadata.endIndex && entity.endIndex <= compositeEntityMetadata.endIndex){
                    $this.addProperty(childrenEntites, entity.type, $this.computeEntityValue(entity));
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
    private addProperty(obj: any, key: string, value: any){
        if(key in obj && Array.isArray(obj[key]))
            obj[key] = obj[key].concat(value);
        else if(key in obj)
            obj[key] = [].concat(obj[key]).concat(value);
        else
            obj[key] = value;
    }
}

