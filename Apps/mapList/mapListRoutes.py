from flask import Response, json, Blueprint, render_template
from .database import *
from . import utils

mapList = Blueprint('mapList', __name__, static_url_path="/mapList", static_folder="static", template_folder="templates")


@mapList.route('/geojson')
def getGeojson():
    db = getConnexion()
    sql= """ SELECT  ST_AsGeoJSON(ST_TRANSFORM(geom_point, 4326)) AS geom, id_synthese 
             FROM bdn.synthese
             WHERE valide = FALSE """

    myGeoJson = utils.toGeoJson(sql=sql, geom='geom', properties=['id_synthese'], cur=db.cur)
    db.closeAll()

    return Response(json.dumps(myGeoJson), mimetype='application/json')


@mapList.route('/delete/<id_synt>')
def deleteRow(id_synt):
    db = getConnexion()
    id_synt = str(id_synt)
    sql = """DELETE FROM bdn.synthese WHERE id_synthese = %s; """
    param = [id_synt]
    db.cur.execute(sql, param) 
    db.conn.commit()
    db.closeAll()
    return json.dumps({'success':True, 'id_synthese':id_synt}), 200, {'ContentType':'application/json'}


@mapList.route('/validate/<id_synt>')
def validateRow(id_synt):
    db = getConnexion()
    id_synt = str(id_synt)
    sql = """UPDATE bdn.synthese
             SET valide = TRUE
             WHERE id_synthese = %s;"""
    param = [id_synt]
    db.cur.execute(sql,param) 
    db.conn.commit()
    db.closeAll()
    return json.dumps({'success':True, 'id_synthese':id_synt}), 200, {'ContentType':'application/json'}

@mapList.route("/")
def hello():
    db = getConnexion()
    sql = """ SELECT f.id_synthese, f.observateur, f.protocole, f.cd_nom, t.nom_vern, t.lb_nom, f.date
     FROM bdn.synthese f
     JOIN taxonomie.taxref_v10 t ON t.cd_nom = f.cd_nom
     WHERE f.valide = FALSE """
    db.cur.execute(sql)
    mytab = db.cur.fetchall()
    taxList = list() 
    for t in mytab:
        temp = [t[0], t[2], t[4].decode('utf-8'), t[5], t[6], t[1], t[3]]
        taxList.append(temp)
    db.closeAll()
    #closeAll(db)
    return render_template('index.html', URL_APPLICATION=config.URL_APPLICATION, taxList=taxList)
