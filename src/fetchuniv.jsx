const Pagination = ({ items, pageSize, onPageChange, currentPage }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num);
  const list = pages.map((page) => {
    return (
      <li
        key={page}
        onClick={onPageChange}
        className={currentPage == page ? "page-item active" : "page-item"}
      >
        <a className="page-link" href="#">
          {page}
        </a>
      </li>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};
// App that gets universities from country
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("Nicaragua");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://universities.hipolabs.com/search?country=Nicaragua",
    []
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>
      <form
        class="d-flex"
        onSubmit={(event) => {
          doFetch(`http://universities.hipolabs.com/search?country=${query}`);
          event.preventDefault();
        }}
      >
        <div id="searchsection">
          <div className="form-group row">
            <div>
              {" "}
              <input
                className="form-control me-sm-2"
                placeholder="Write your country"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-outline-primary" type="submit">
            Search
          </button>
        </div>
      </form>
      <h5>
        <small class="text-muted">Write country name in english</small>
      </h5>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <div id="univList">
          {page.map((item, index) => (
            <div key={index} className="card bg-secondary mb-3">
              <div className="card-header">{item.name}</div>
              <div className="card-body">
                <a
                  className="card-title"
                  href={item.web_pages[0]}
                  target="_blank"
                >
                  {item.web_pages[0]}
                </a>
                <div className="card-text">
                  <p>State: {item["state-province"]}</p>
                  <p>Country: {item.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div id="pagin">
        <Pagination
          items={data}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          currentPage={currentPage}
        ></Pagination>
      </div>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
