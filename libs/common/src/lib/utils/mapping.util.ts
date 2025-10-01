/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Generic mapper utility for transforming data between types
 */

// Type definitions for external AutoMapper library
interface AutoMapper {
  createMap(sourceKey: string, destinationKey: string): any;
  map(sourceKey: string, destinationKey: string, sourceObject: any, destination?: any): any;
}

// Try to load AutoMapper if available
let externalMapper: AutoMapper | undefined;
try {
  // The automapper-ts library directly exports the AutoMapper instance
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  externalMapper = require('automapper-ts');
} catch (e) {
  // AutoMapper not available, we'll use our custom implementation
  console.warn('AutoMapper library not available, using custom implementation');
}

// Type definitions for our custom AutoMapper-like functionality
interface IMappingConfiguration<TSource, TDestination> {
  forMember(
    destinationProperty: keyof TDestination,
    valueSelector: (source: TSource) => any
  ): IMappingConfiguration<TSource, TDestination>;
  
  ignore(destinationProperty: keyof TDestination): IMappingConfiguration<TSource, TDestination>;
}

// Store for mapping configurations
class MappingStore {
  private mappings: Map<string, (source: any) => any> = new Map();

  createMap<TSource, TDestination>(
    sourceKey: string,
    destinationKey: string
  ): IMappingConfiguration<TSource, TDestination> {
    const mappingKey = `${sourceKey}:${destinationKey}`;
    const propertyMappings = new Map<keyof TDestination, (source: TSource) => any>();
    const ignoredProperties = new Set<keyof TDestination>();

    // Default mapping function
    const defaultMappingFn = (source: TSource): TDestination => {
      if (!source) return {} as TDestination;
      
      const result = {} as TDestination;
      
      // Copy all properties by default
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key) && 
            !ignoredProperties.has(key as unknown as keyof TDestination)) {
          // Type-safe assignment using type assertion
          (result as any)[key] = source[key];
        }
      }
      
      // Apply custom property mappings
      propertyMappings.forEach((mapFn, destKey) => {
        if (!ignoredProperties.has(destKey)) {
          result[destKey] = mapFn(source);
        }
      });
      
      return result;
    };
    
    this.mappings.set(mappingKey, defaultMappingFn);
    
    // Return configuration interface
    return {
      forMember: (destProp, valueFn) => {
        propertyMappings.set(destProp, valueFn);
        return this as unknown as IMappingConfiguration<TSource, TDestination>;
      },
      ignore: (destProp) => {
        ignoredProperties.add(destProp);
        return this as unknown as IMappingConfiguration<TSource, TDestination>;
      }
    };
  }
  
  map<TSource, TDestination>(
    sourceKey: string,
    destinationKey: string,
    sourceObject: TSource
  ): TDestination {

    const mappingKey = `${sourceKey}:${destinationKey}`;
    const mappingFn = this.mappings.get(mappingKey);
    
    if (!mappingFn) {
      throw new Error(`No mapping defined from ${sourceKey} to ${destinationKey}`);
    }
    
    return mappingFn(sourceObject);
  }
}

// Create a singleton instance
const mapper = new MappingStore();

/**
 * Creates a mapping configuration between source and target types
 * @param sourceKey The source type identifier
 * @param targetKey The target type identifier
 * @returns A mapping configuration interface
 */
export const createMap = <TSource extends object, TDestination extends object>(
  sourceKey: string,
  targetKey: string
): IMappingConfiguration<TSource, TDestination> => {
  if (externalMapper) {
    try {
      // Try to use the automapper-ts library if available
      return externalMapper.createMap(sourceKey, targetKey) as unknown as IMappingConfiguration<TSource, TDestination>;
    } catch (e) {
      // Fall back to our custom implementation if automapper-ts throws an error
      console.warn('Error using AutoMapper, falling back to custom implementation', e);
    }
  }
  return mapper.createMap<TSource, TDestination>(sourceKey, targetKey);
};

/**
 * Maps a single item from source type to target type
 * @param sourceKey The source type identifier
 * @param targetKey The target type identifier
 * @param source The source item to map
 * @returns The mapped target item
 */
export const mapObject = <TSource extends object, TDestination extends object>(
  sourceKey: string,
  targetKey: string,
  source: TSource
): TDestination => {
  if (externalMapper) {
    try {
      // Try to use the automapper-ts library if available
      return externalMapper.map(sourceKey, targetKey, source) as TDestination;
    } catch (e) {
      // Fall back to our custom implementation if automapper-ts throws an error
      console.warn('Error using AutoMapper, falling back to custom implementation', e);
    }
  }
  return mapper.map(sourceKey, targetKey, source);
};

/**
 * Maps an array of items from source type to target type
 * @param sourceKey The source type identifier
 * @param targetKey The target type identifier
 * @param source The source array to map
 * @returns The array of mapped target items
 */
export const mapArray = <TSource extends object, TDestination extends object>(
  sourceKey: string,
  targetKey: string,
  source: TSource[]
): TDestination[] => {
  return source.map(item => mapObject(sourceKey, targetKey, item));
};
