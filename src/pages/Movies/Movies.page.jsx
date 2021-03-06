import React, { Component } from "react"
import _ from 'lodash'
import { deleteMovie, getMovies } from "../../services/movieService"
import Pagination from "../../components/Pagination/Pagination.component"
import {paginate} from '../../components/Pagination/paginate.utils'
import Genres from "../../components/Genres/Genres.component";
import { getGenres } from "../../services/genreService"
import MovieTable from "../../components/MovieTable/MovieTabe.component"
import SearchBox from "../../components/SearchBox/SearchBox.component"
import { toast } from "react-toastify"

class Movies extends Component {
  state = {
    movies: [],
    genres : [],
    pageSize : 4,
    currentPage : 1,
    currentGenre : '',
    searchQuery : '',
    sortColumn : {path : 'title', order : 'asc'}
  };

  handleDelete = async movie => {
    const originalMovies = this.state.movies
    const movies = originalMovies.filter(m => m.id !== movie.id)
    this.setState({ movies });
    try{
      await deleteMovie(movie.id)
    }catch(ex){
      if(ex.response && ex.response.status === 404)
        toast.error('This Movie has already beeen deleted!!!')
      if(ex.response && ex.response.status === 400)
        toast.error('Authentication Error : You need to login first to delete the movie!!!')
      if(ex.response && ex.response.status === 403)
        toast.error('Authorization Error : You\'re not authorized to delete the movie!!!')
      this.setState({ movies : originalMovies });
    }
  }
  handleLike = movie => {
    const movies = [...this.state.movies]
    const index = movies.indexOf(movie)
    movies[index] = {...movies[index]}
    movies[index].liked = !movies[index].liked
    this.setState({movies})
  }
  handlePageChange = pageNumber => {
    this.setState({currentPage : pageNumber})
  }
  handleSelect = genre => {
    this.setState({currentGenre : genre})
    this.setState({searchQuery : '' })
    this.setState({currentPage : 1})
  }
  handleSort = sortColumn => {
    this.setState({sortColumn})
  }
  handleSearch = query => {
    this.setState({searchQuery : query, currentGenre : null, currentPage : 1})
  }
  getPageData = () => {
    const {
      currentPage, 
      currentGenre, 
      pageSize, 
      sortColumn, 
      searchQuery, 
      movies : allMovies 
    } = this.state
    let filtered = allMovies
    if(searchQuery!=='')
      filtered = allMovies.filter(m=> 
        m.title.toLowerCase().startsWith(searchQuery.toLowerCase())
        )
    else if(currentGenre)
        filtered = allMovies.filter(m => m.genre_id === currentGenre)

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order])
    const movies =  paginate(sorted, currentPage, pageSize)
    return {totalCount : filtered.length, data: movies}
  }
  async componentDidMount() {
    const {data} = await getGenres()
    const genres = [...data]
    const {data : movies} = await getMovies()
    this.setState({
      movies,
      genres 
    })
  }

  render() {
    const {history,user} = this.props
    const { length: count } = this.state.movies
    console.log(user)
    if (!count) return <h4>There are no movies in the database.</h4>
    const {
      currentPage, 
      currentGenre, 
      pageSize, 
      genres,
      sortColumn, 
      searchQuery
    } = this.state
    const {totalCount, data} = this.getPageData()

    return (
      <div className="row">
        <div className="col-3">
          <Genres 
            genres={genres} 
            onItemSelect={this.handleSelect} 
            currentGenre={currentGenre}
          />
        </div>
        <div className="col">
          { user && <button className='btn btn-primary btn-lg' onClick={ () => history.push('/movies/new')}>New Movie</button> }
          <SearchBox value={searchQuery} placeholder='Search by Title...' onChange={this.handleSearch} />
          <h4 className='mt-3'>Showing {totalCount} movies in the database.</h4>
          <MovieTable 
            movies={data} 
            sortColumn={sortColumn}
            handleLike={this.handleLike} 
            handleDelete={this.handleDelete} 
            handleSort={this.handleSort} 
          />
          <Pagination 
            itemCount={totalCount} 
            currentPage={currentPage} 
            pageSize={pageSize} 
            onPageChange={this.handlePageChange} 
          />
        </div>
      </div>
    );
  }
}

export default Movies