const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
} = graphql; // id verisinin int yerine string ya da vice versa oldugunda ariza cikmasin diye GraphQLID kullaniliyor.
const _ = require("lodash");
const Movie = require("../models/Movie");
const Director = require("../models/Director");




const DirectorType = new GraphQLObjectType({
  name: "Director",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    birth: { type: GraphQLInt },
    movies: {
      type: new GraphQLList(MovieType),   // bir yonetmenin birden fazla filmi olabilecegi icin liste seklinde tanimlamamiz gerekiyor.
      resolve(parentValue, args) {
        return Movie.find({ directorId: parentValue.id });
      },
    },
  }),
});

const MovieType = new GraphQLObjectType({
  name: "Movie",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    year: { type: GraphQLInt },
    director: {
      type: DirectorType,   // bir filmin bir tane yonetmeni oldugu icin DirectorType'i dogrudan verip kullanabiliriz ama birden fazla yonetmeni olan bir tip olsaydi burada liste seklinde tanimlamamiz gerekecekti.
      resolve(parentValue, args) {
        return Director.findById(parentValue.directorId);
      },
    },
  }),
});

// root query, butun typelarin tutuldugu yer (movietype, director type vs)
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    movie: {
      type: MovieType,
      args: { id: { type: GraphQLID } }, //movie objesini ararken neye gore arayacagimizi soyluyoruz ve parametre olarak veriyoruz
      resolve(parentValue, args) {
        return Movie.findById(args.id);
      },
    },
    director: {
      type: DirectorType,
      args: { id: { type: GraphQLID } },
      resolve(parentValue, args) {
        return Director.findById(args.id);
      },
    },
    movies: {
        type: new GraphQLList(MovieType),
        resolve(parentValue, args) {
          return Movie.find({});
        }
    },
    directors: {
        type: new GraphQLList(DirectorType),
        resolve(parentValue, args) {
          return Director.find({});
        }
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
