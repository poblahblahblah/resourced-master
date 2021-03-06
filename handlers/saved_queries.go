package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/resourced/resourced-master/config"
	"github.com/resourced/resourced-master/dal"
	"github.com/resourced/resourced-master/libhttp"
)

func PostSavedQueries(w http.ResponseWriter, r *http.Request) {
	dbs := r.Context().Value("dbs").(*config.DBConfig)

	currentUser := r.Context().Value("currentUser").(*dal.UserRow)

	accessTokenRow, err := dal.NewAccessToken(dbs.Core).GetByUserID(nil, currentUser.ID)
	if err != nil {
		libhttp.HandleErrorJson(w, err)
		return
	}

	savedQueryType := r.FormValue("Type")
	savedQuery := r.FormValue("SavedQuery")

	_, err = dal.NewSavedQuery(dbs.Core).CreateOrUpdate(nil, accessTokenRow, savedQueryType, savedQuery)
	if err != nil {
		libhttp.HandleErrorJson(w, err)
		return
	}

	http.Redirect(w, r, r.Referer(), 301)
}

func PostPutDeleteSavedQueriesID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html")

	method := r.FormValue("_method")

	if strings.ToLower(method) == "delete" {
		DeleteSavedQueriesID(w, r)
	}
}

func DeleteSavedQueriesID(w http.ResponseWriter, r *http.Request) {
	savedQueryID, err := getInt64SlugFromPath(w, r, "id")
	if err != nil {
		libhttp.HandleErrorJson(w, err)
		return
	}

	dbs := r.Context().Value("dbs").(*config.DBConfig)

	currentUser := r.Context().Value("currentUser").(*dal.UserRow)

	currentCluster := r.Context().Value("currentCluster").(*dal.ClusterRow)

	sq := dal.NewSavedQuery(dbs.Core)

	savedQueryRow, err := sq.GetByID(nil, savedQueryID)

	if currentUser.ID != savedQueryRow.UserID {
		err := errors.New("Modifying other user's saved query is not allowed.")
		libhttp.HandleErrorJson(w, err)
		return
	}

	_, err = sq.DeleteByClusterIDAndID(nil, currentCluster.ID, savedQueryID)
	if err != nil {
		libhttp.HandleErrorJson(w, err)
		return
	}

	http.Redirect(w, r, r.Referer(), 301)
}
