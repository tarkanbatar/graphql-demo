const graphql = require("graphql");
const mongoose = require('mongoose');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull
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
      type: new GraphQLList(MovieType), // bir yonetmenin birden fazla filmi olabilecegi icin liste seklinde tanimlamamiz gerekiyor.
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
      type: DirectorType, // bir filmin bir tane yonetmeni oldugu icin DirectorType'i dogrudan verip kullanabiliriz ama birden fazla yonetmeni olan bir tip olsaydi burada liste seklinde tanimlamamiz gerekecekti.
      resolve(parentValue, args) {
        if (!mongoose.Types.ObjectId.isValid(parentValue.directorId)) {
          return null;
        }
        return Director.findById(parentValue.directorId);
      },
    },
  }),
});

// root query, butun typelarin tutuldugu yer (movietype, director type vs)
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    movie: {
      type: MovieType,
      args: { id: { type: GraphQLID } }, //movie objesini ararken neye gore arayacagimizi soyluyoruz ve parametre olarak veriyoruz
      resolve(parentValue, args) {
        if (!mongoose.Types.ObjectId.isValid(args.id)) {
          // Invalid ObjectId provided; return null to avoid CastError
          return null;
        }
        return Movie.findById(args.id);
      },
    },
    director: {
      type: DirectorType,
      args: { id: { type: GraphQLID } },
      resolve(parentValue, args) {
        if (!mongoose.Types.ObjectId.isValid(args.id)) {
          // Invalid ObjectId provided; return null to avoid CastError
          return null;
        }
        return Director.findById(args.id);
      },
    },
    movies: {
      type: new GraphQLList(MovieType),
      resolve(parentValue, args) {
        return Movie.find({});
      },
    },
    directors: {
      type: new GraphQLList(DirectorType),
      resolve(parentValue, args) {
        return Director.find({});
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation", //CRUD islemleri graphql tarafinda mutation olarak adlandirilir.
  fields: {
    addMovie: {
      type: MovieType,
      args: {
        id: { type: GraphQLID },
        title: { type: new GraphQLNonNull(GraphQLString) },       //non null alanlar bu sekilde zorunlu hale getirilir.
        description: { type: GraphQLString },
        year: { type: GraphQLInt },
        directorId: { type: GraphQLID },
      },
      resolve(parentValue, args) {
          if (args.directorId && !mongoose.Types.ObjectId.isValid(args.directorId)) {
            throw new Error('Invalid directorId: must be a valid ObjectId');
          }
          const movie = new Movie({
            id: args.id,
            title: args.title,
            description: args.description,
            year: args.year,
            directorId: args.directorId,
          });
          return movie.save()
            .then(saved => {
              console.log('addMovie saved:', saved);
              return saved;
            })
            .catch(err => {
              console.error('addMovie error saving movie:', err);
              throw err;
            });
      },
    },
    addDirector: {
      type: DirectorType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        birth: { type: GraphQLInt },
      },
      resolve(parentValue, args) {
        const director = new Director({
          id: args.id,
          name: args.name,
          birth: args.birth,
        });
        return director.save();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
