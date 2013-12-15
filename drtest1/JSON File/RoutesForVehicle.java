package org.npbool.data;

import java.io.BufferedWriter;
import java.util.ArrayList;

import org.npbool.Util;
import org.npbool.adjlist.Pair;

public class RoutesForVehicle {
	public int numOfVehicles;
	public Coord depot;
	//routes stores the coordinates of each point (including delivery point and ordinary point on the map) for each vehicle. Each route starts from the depot, but ends with the previous point before 
	//depot, you should add the depot as the last point.
	//In this task, you could only use the routes information and display them in the map.
	public ArrayList<ArrayList <Coord>> routes;
	
	//routesinfo just stores the intermediate delivery points of each route and the travel time when arriving at each delivery point.
	//For each route, it starts from the first delivery point and ends with depot.
	//It is not necessary to use for this task.
	public ArrayList <ArrayList <Station>> routesInfo;
	
	public RoutesForVehicle(int num, Coord d){
		numOfVehicles = num;
		depot = d;
		routes = new ArrayList<ArrayList<Coord>>(numOfVehicles);	
		for (int i = 0; i < numOfVehicles; i++){
			routes.add(new ArrayList<Coord>());
			routes.get(i).add(getCoord());
		}
		routesInfo = new ArrayList<ArrayList <Station>>(numOfVehicles);
		for (int i = 0; i < numOfVehicles; i++){
			routesInfo.add(new ArrayList<Station>());
		}	
	}
	
	public void clearRoutes(){
		for (int i = 0; i < numOfVehicles; i++){
			routes.get(i).clear();
			routesInfo.get(i).clear();
		}	
		for (int i = 0; i < numOfVehicles; i++){
			routes.get(i).add(getCoord());
		}
	}
	
	public Coord getCoord(){
		return depot;
	}
	
	public static void main(String[] args){
		/*RouteConfig config = new RouteConfig();
		config.vehicles = 3;
		config.depot = new Coord(-118+Math.random(), 33+Math.random());
		config.stations = new ArrayList<Coord>();
		*/
		int num = 3;
		Coord d = new Coord(-118+Math.random(), 33+Math.random());
		RoutesForVehicle rv = new RoutesForVehicle(num, d);
		for(int i=0;i<num;++i){
			for (int j = 0; j < 5; j++){
				rv.routes.get(i).add(new Coord(-118+Math.random(), 33+Math.random()));
			}
		}
		try{
			BufferedWriter bw = Util.getBufWriter("C:/Route/routes.json");
			bw.write(Util.gson.toJson(rv));
			bw.close();
		} catch(Exception e){
			e.printStackTrace();
		}
	}
}
