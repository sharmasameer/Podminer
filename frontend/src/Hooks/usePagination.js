import Axios from "axios";
import { useEffect, useState } from "react";

export const usePagination = (url, search, page, loadMore = false) => {
  const [state, setState] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [fetchData, setFetchData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!search) return;
      setLoading(true);
      try {
        const { data } = await Axios.get(
          `${url}&page=${page}&search=${search}`
        );
        console.log(data);
        if (data.results.length === 0) setState([]);
        if (page * 10 < data.count) setHasMore(true);
        if (data.results.length < 10) setHasMore(false);
        if (loadMore) setState((prevState) => [...prevState, ...data.results]);
        else {
          setState(data.results);
          setFetchData(false);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    if (fetchData) fetchData();
  }, [url, page, fetchData]);
  return { state, error, loading, hasMore, setFetchData };
};
