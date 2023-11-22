/*--------------------------------------------------------------------------

@sinclair/typebox/type

The MIT License (MIT)

Copyright (c) 2017-2023 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import type { TupleToIntersect, AssertType } from '../helpers/index'
import type { TSchema, SchemaOptions } from '../schema/index'
import type { Static } from '../static/index'
import { type TNever, Never } from '../never/index'
import { OptionalFromIntersect } from '../modifiers/index'
import { Kind } from '../symbols/index'
import { CloneType, CloneRest } from '../clone/type'
import { TTransform as IsTransformType, TObject as IsObjectType, TSchema as IsSchemaType } from '../guard/type'

// ------------------------------------------------------------------
// IntersectResolve
// ------------------------------------------------------------------
// prettier-ignore
export type IntersectResolve<T extends TSchema[]> = (
  T extends [] ? TNever :
  T extends [TSchema] ? T[0] :
  OptionalFromIntersect<T>
)
// prettier-ignore
export function IntersectResolve<T extends TSchema[]>(T: T): IntersectResolve<T> {
  return (
    T.length === 0 
      ? Never() 
      : T.length === 1 
        ? T[0] 
        : OptionalFromIntersect(T)) as IntersectResolve<T>
}
// ------------------------------------------------------------------
// TIntersect
// ------------------------------------------------------------------
export type TUnevaluatedProperties = undefined | TSchema | boolean
export interface IntersectOptions extends SchemaOptions {
  unevaluatedProperties?: TUnevaluatedProperties
}
export interface TIntersect<T extends TSchema[] = TSchema[]> extends TSchema, IntersectOptions {
  [Kind]: 'Intersect'
  static: TupleToIntersect<{ [K in keyof T]: Static<AssertType<T[K]>, this['params']> }>
  type?: 'object'
  allOf: [...T]
}
/** `[Json]` Creates an Intersect type */
export function Intersect<T extends TSchema[]>(T: [...T], options: IntersectOptions = {}): IntersectResolve<T> {
  if (T.length === 0) return Never() as IntersectResolve<T>
  if (T.length === 1) return CloneType(T[0], options) as IntersectResolve<T>
  if (T.some((schema) => IsTransformType(schema))) throw new Error('Cannot intersect transform types')
  const allObjects = T.every((schema) => IsObjectType(schema))
  const clonedUnevaluatedProperties = IsSchemaType(options.unevaluatedProperties) ? { unevaluatedProperties: CloneType(options.unevaluatedProperties) } : {}
  return (options.unevaluatedProperties === false || IsSchemaType(options.unevaluatedProperties) || allObjects
    ? { ...options, ...clonedUnevaluatedProperties, [Kind]: 'Intersect', type: 'object', allOf: CloneRest(T) }
    : { ...options, ...clonedUnevaluatedProperties, [Kind]: 'Intersect', allOf: CloneRest(T) }) as unknown as IntersectResolve<T>
}
