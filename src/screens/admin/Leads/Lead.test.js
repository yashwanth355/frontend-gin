//Leads.test.jsx

import Leads from "./index";
import { render, fireEvent, act as reactAct, queryByAttribute } from "@testing-library/react";
import fetchMock from 'fetch-mock';

const getById = queryByAttribute.bind(null, "id");

const mockUrlApi = () => {
  let urlDeferred;
  const urlPromise = new Promise((resolve, reject) => {
    urlDeferred = { reject, resolve };
  });

  fetchMock.getOnce("https://c30j81s4jj.execute-api.ap-south-1.amazonaws.com/dev/dev-getLeadsInfo", urlPromise, { overwriteRoutes: false });
  return urlDeferred;
};

const mockResponse = { "New Mock": "New Mock Data" };

afterEach(() => {
  fetchMock.reset();
  fetchMock.restore();
});

test("Leads component render correctly", async () => {

  const urlDeferred = mockUrlApi();

  let dom;
  reactAct(() => {
    dom = render(<Leads />);
  });

  // const btn = getById(dom.container, "btnClick");
  fireEvent.load();
  await reactAct(async () => {
    await urlDeferred.resolve(mockResponse);
  });

  const dataElement = getById(dom.container, "data");
  expect(dataElement.length).toBe(1);
  dom.unmount();
});
