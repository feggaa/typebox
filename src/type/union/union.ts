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

import type { TSchema, SchemaOptions } from '../schema/index'
import type { Static } from '../static/index'
import { type TNever, Never } from '../never/index'
import { OptionalFromUnion } from '../modifiers/index'
import { CloneType, CloneRest } from '../clone/type'
import { Kind } from '../symbols/index'

// ------------------------------------------------------------------
// UnionResolve
// ------------------------------------------------------------------
// prettier-ignore
export type UnionResolve<T extends TSchema[]> = (
  T extends [] ? TNever :
  T extends [TSchema] ? T[0] :
  OptionalFromUnion<T>
)
// prettier-ignore
export function UnionResolve<T extends TSchema[]>(T: [...T]): UnionResolve<T> {
  return (
    T.length === 0 ? Never() : 
    T.length === 1 ? T[0] : 
    OptionalFromUnion(T)
  ) as UnionResolve<T>
}
// ------------------------------------------------------------------
// TUnion
// ------------------------------------------------------------------
// prettier-ignore
export interface TUnion<T extends TSchema[] = TSchema[]> extends TSchema {
  [Kind]: 'Union'
  static: { [K in keyof T]: T[K] extends TSchema ? Static<T[K], this['params']> : never }[number]
  anyOf: T
}
/** `[Json]` Creates a Union type */
// prettier-ignore
export function Union<T extends TSchema[]>(T: [...T], options: SchemaOptions = {}): UnionResolve<T> {
  return (
    T.length === 0 ? Never(options) : 
    T.length === 1 ? CloneType(T[0], options) : 
    { ...options, [Kind]: 'Union', anyOf: CloneRest(T) 
  }) as UnionResolve<T>
}
