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
import type { UnionToTuple, AssertRest, AssertType, Assert } from '../helpers/index'
import { type TTemplateLiteral, TemplateLiteralToUnion } from '../template-literal/index'
import { type TUnion, Union } from '../union/index'
import { type TNever, Never } from '../never/index'
import { type TLiteral } from '../literal/index'
import { type Static } from '../static/index'
import { ExtendsCheck, ExtendsResult } from '../extends/index'
import { UnionResolve } from '../union/index'
import { CloneType } from '../clone/type'
import { TTemplateLiteral as IsTemplateLiteralType, TUnion as IsUnionType } from '../guard/type'

// ------------------------------------------------------------------
// ExcludeResolve
// ------------------------------------------------------------------
// prettier-ignore
type ExcludeTemplateLiteralResult<T extends string> = UnionResolve<AssertRest<UnionToTuple<{ [K in T]: TLiteral<K> }[T]>>>
// prettier-ignore
type ExcludeTemplateLiteral<T extends TTemplateLiteral, U extends TSchema> = (
  Exclude<Static<T>, Static<U>> extends infer S ? ExcludeTemplateLiteralResult<Assert<S, string>> : never
)
// prettier-ignore
type ExcludeArray<T extends TSchema[], U extends TSchema> = AssertRest<UnionToTuple<{
  [K in keyof T]: Static<AssertType<T[K]>> extends Static<U> ? never : T[K]
}[number]>> extends infer R extends TSchema[] ? UnionResolve<R> : never
// prettier-ignore
type ExcludeResolve<T extends TSchema, U extends TSchema> =
  T extends TTemplateLiteral ? ExcludeTemplateLiteral<T, U> :
  T extends TUnion<infer S> ? ExcludeArray<S, U> :
  T extends U 
    ? TNever 
    : T
// prettier-ignore
export function ExcludeResolve<L extends TSchema, R extends TSchema>(L: L, R: R): ExcludeResolve<L, R> {
  return (
    IsTemplateLiteralType(L) ? ExcludeResolve(TemplateLiteralToUnion(L), R) :
    IsTemplateLiteralType(R) ? ExcludeResolve(L, TemplateLiteralToUnion(R)) :
    IsUnionType(L) ? (() => {
      const narrowed = L.anyOf.filter((inner) => ExtendsCheck(inner, R) === ExtendsResult.False)
      return (narrowed.length === 1 ? narrowed[0] : Union(narrowed))
    })() :
    ExtendsCheck(L, R) !== ExtendsResult.False ? Never() :
    L
  ) as ExcludeResolve<L, R>
}
// ------------------------------------------------------------------
// TExclude
// ------------------------------------------------------------------
export type TExclude<T extends TSchema, U extends TSchema> = ExcludeResolve<T, U>

/** `[Json]` Constructs a type by excluding from unionType all union members that are assignable to excludedMembers */
export function Exclude<L extends TSchema, R extends TSchema>(unionType: L, excludedMembers: R, options: SchemaOptions = {}): TExclude<L, R> {
  const E = ExcludeResolve(unionType, excludedMembers) as any
  return CloneType(E, options) as TExclude<L, R>
}
