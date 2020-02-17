import { expect } from 'chai';
import { Given, TableDefinition, Then } from 'cucumber';
import * as jPath from 'jsonpath';
import { CbApi } from '../api/inner/cb.api';
import { Helper } from '../utils/helper';

/// API
Given(/^"(GET|POST|PUT)" endpoint "(.*)" should return:$/, async function (
  method: string,
  endpointPath: string,
  data: TableDefinition
) {
  const resp = await new CbApi().request(
    Helper.replaceWithWorldValue(endpointPath, this),
    method,
    JSON.parse(Helper.replaceWithWorldValue(data.hashes()[0].data, this))
  );
  this.setApiResp(resp);
  const ar = new RegExp(data.hashes()[0].body.replace('?', '\\?'), 'g');
  expect(resp.status.toString()).equal(data.hashes()[0].status);
  expect(JSON.stringify(resp.data)).to.matches(ar);
});

Given(/^user do "(PUT|POST)" to endpoint "(.*)" with:$/, async function (
  method: string,
  endpointPath: string,
  JsonData: string
) {
  const resp = await new CbApi().request(
    Helper.replaceWithWorldValue(endpointPath, this),
    method,
    JSON.parse(Helper.replaceWithWorldValue(JsonData, this))
  );
  this.setApiResp(resp);
  expect(this.getApiResp()).to.equal(resp);
});

Given(/^user do "(GET|HEAD)" to endpoint "(.*)"$/, async function (
  method: string,
  endpointPath: string
) {
  const resp = await new CbApi().request(
    Helper.replaceWithWorldValue(endpointPath, this),
    method
  );
  this.setApiResp(resp);
  expect(this.getApiResp()).to.equal(resp);
});

Then(/^keep the JSON response at "(.*)" as "(.*)"$/, function (
  path: string,
  varName: string
) {
  // use JsonPath or array path
  const keepValue = path.startsWith('$')
    ? jPath.query(this.getApiResp().data, path).pop()
    : this.getApiResp().data[path];
  this.keepValue(varName, keepValue);
  expect(this.findValue(varName));
});

Then(/^the JSON "(.*)" should have "(.*)" of "(.*)"$/, function (
  path: string,
  fieldName: string,
  value: string
) {
  const expRes = this.findValue(value.replace(/(%{|})/g, ''));
  const jsonPath = path.split('.');
  let respObj = this.getApiResp().data;
  jsonPath.forEach(x => (respObj = respObj[x]));
  const actRes = respObj[fieldName];
  expect(actRes).to.equal((expRes || value).toString());
});
