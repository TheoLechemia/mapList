from Apps.initApp import app

from Apps.mapList.mapListRoutes import mapList

app.register_blueprint(mapList, url_prefix='/mapList')


if __name__ == "__main__":
    app.run(debug=True)