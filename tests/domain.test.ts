import { strict as assert } from "node:assert";
import { test } from "node:test";
import { emptyProfile, initialState, makeTasks, opportunities, parseState, rankOpportunities, reality } from "../lib/domain.ts";

test("Reality Check computes weekly load and zero capacity without division errors",()=>{
  assert.deepEqual(reality(emptyProfile,opportunities[0],3),{available:6,required:6,overload:0,remaining:0,affordable:true,eligible:true});
  assert.equal(reality({...emptyProfile,committed:10},opportunities[0],1).overload,18);
  assert.equal(reality(emptyProfile,opportunities[0],6).remaining,3);
});
test("Eligibility, cost, and relevance remain independent",()=>{
  const profile={...emptyProfile,interests:["Teknologi"],student:false,budget:0};
  assert.equal(rankOpportunities(profile)[0].id,"code");
  assert.equal(reality(profile,opportunities[0]).eligible,false);
  assert.equal(reality(profile,opportunities[2]).eligible,true);
  assert.equal(reality(profile,opportunities[2]).affordable,false);
});
test("Support adapts to the barrier and tasks begin incomplete",()=>{
  const novice=makeTasks(opportunities[0],"Belum punya pengalaman");
  const busy=makeTasks(opportunities[0],"Waktu terasa sempit");
  assert.notEqual(novice[1].title,busy[1].title);
  assert.ok(novice.every(t=>!t.done));
  assert.equal(new Set(novice.map(t=>t.id)).size,novice.length);
});
test("Persisted state rejects corrupt, unsupported, or unsafe values",()=>{
  assert.deepEqual(parseState(JSON.stringify(initialState)),initialState);
  assert.equal(parseState("{"),null);
  assert.equal(parseState(JSON.stringify({...initialState,version:2})),null);
  assert.equal(parseState(JSON.stringify({...initialState,saved:["missing"]})),null);
  assert.equal(parseState(JSON.stringify({...initialState,profile:{...emptyProfile,hours:-5}})),null);
  assert.equal(parseState(JSON.stringify({...initialState,journeys:[{}]})),null);
});
