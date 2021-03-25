import React from "react"

import { connect } from "react-redux"

import get from "lodash.get"

import { getUsers } from "@availabs/ams"

import { useAsyncSafe } from "@availabs/avl-components"

const uploadedShorts = Component => {
  const Wrapper = ({ falcor, falcorCache, getUsers, users, ...props }) => {

    const [loading, _setLoading] = React.useState(false),
      setLoading = useAsyncSafe(_setLoading);

    const [[countType, dataType, uploadId], setUploadId] = React.useState(["short", null, null]);

    React.useEffect(() => {
      setLoading(true);
      getUsers();
      falcor.get(["tds", "meta", "upload", "length"])
        .then(res => {
          const length = get(res, ["json", "tds", "meta", "upload", "length"], 0);
          if (length) {
            return falcor.get([
              "tds", "meta", "upload", "byIndex", { from: 0, to: length - 1 },
              ["upload_id", "created_by", "created_at", "status", "meta"]
            ])
          }
        })
        .then(() => setLoading(false));
    }, [getUsers, falcor, setLoading]);

    React.useEffect(() => {
      if (!uploadId) return;

      setLoading(true);
      falcor.get(["tds", countType, dataType, "count", "upload", "byUploadId", uploadId, "length"])
        .then(res => {
          const length = +get(res, ["json", "tds", countType, dataType, "count", "upload",
                                "byUploadId", uploadId, "length"], 0);
          if (length) {
            return falcor.get(
              ["tds", countType, dataType, "count", "upload", "byUploadId", uploadId,
                "byIndex", { from: 0, to: length - 1},
                ['id', 'count_id', 'count_type', 'data_type', 'upload_id', 'status']
              ]
            ).then(res => console.log("RES:", res))
          }
        })
        .then(() => setLoading(false));
    }, [falcor, setLoading, countType, dataType, uploadId]);

    const uploads = React.useMemo(() => {
      const uploads = [];
      const length = +get(falcorCache, ["tds", "meta", "upload", "length"], 0);
      if (length) {
        for (let i = 0; i < length; ++i) {
          const ref = get(falcorCache, ["tds", "meta", "upload", "byIndex", i, "value"]),
            upload = get(falcorCache, ref, null);
          if (upload) {
            uploads.push({
              ...upload,
              expand: [{ meta: get(upload, ["meta", "value"], null) }],
              meta: get(upload, ["meta", "value"], null),
              created_by: users.reduce((a, c) => {
                return `${ c.id }` === `${ upload.created_by }` ? `(${ c.id }) ${ c.email }` : a;
              }, upload.created_by)
            })
          }
        }
      }
      return uploads;
    }, [falcorCache, users]);

    const counts = React.useMemo(() => {
      const length = +get(falcorCache,
        ["tds", countType, dataType, "count", "upload", "byUploadId", uploadId, "length"], 0
      );
      if (!(uploadId && length)) return [];

      const counts = [];
      for (let i = 0; i < length; ++i) {
        const ref = get(falcorCache,
            ["tds", countType, dataType, "count", "upload", "byUploadId", uploadId, "byIndex", i, "value"]
          ),
          count = get(falcorCache, ref, null);
        if (count) {
          counts.push(count);
        }
      }
      return counts;
    }, [falcorCache, countType, dataType, uploadId]);

    return (
      <Component { ...props } uploads={ uploads } users={ users }
        loading={ loading } counts={ counts }
        setUploadId={ setUploadId }/>
    )
  }
  const mapStateToProps = state => ({
    users: state.users
  });
  return connect(mapStateToProps, { getUsers })(Wrapper);
}
export default uploadedShorts
