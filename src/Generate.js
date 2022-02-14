import React, { Component } from 'react'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import Jokecard from './Jokecard'
import './Generate.css'

export default class Generate extends Component {
    static defaultProps = {
        jokesLength: 10
    }
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            jokesList: JSON.parse(window.localStorage.getItem('jokesList') || '[]')
        }
        this.seenJokes = new Set(this.state.jokesList.map(j => j.text))
        console.log(this.seenJokes)
        this.fetchJokes = this.fetchJokes.bind(this)
    };
    componentDidMount() {
        if (this.state.jokesList.length === 0) this.fetchJokes()
    };
    async fetchJokes() {
        let newJokesArr = [];
        try {
            this.setState({ isLoading: true })
            while (newJokesArr.length < this.props.jokesLength) {
                const joke = await axios.get('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } });
                const newJoke = joke.data.joke;
                if (!this.seenJokes.has(newJoke)) {
                    newJokesArr.push({ text: newJoke, id: uuidv4(), votes: 0 })
                } else {
                    console.log('duplicate joke found!');
                    console.log(newJoke);
                }
            };
            this.setState(st => ({
                jokesList: [...st.jokesList, ...newJokesArr]
            }),
                () => {
                    window.localStorage.setItem(
                        "jokesList",
                        JSON.stringify(this.state.jokesList)
                    )
                    this.setState({ isLoading: false })
                }
            );
        }
        catch (e) {
            alert(e)
            this.setState({ isLoading: false })
        }
    }
    handleVote(id, delta) {
        this.setState(st => ({
            jokesList: st.jokesList.map(j =>
                j.id === id ? { ...j, votes: j.votes += delta } : j
            )
        }),
            () => window.localStorage.setItem(
                "jokesList",
                JSON.stringify(this.state.jokesList)
            )
        )
    }
    render() {
        let loadingPage = <div className='Generate-loading'>
            <div><i className='far fa-8x fa-laugh fa-spin'></i></div>
            <h1 className='Generate-title'>Loading...</h1>
        </div>;
        let jokeDisplay =
            <div>
                {this.state.jokesList.map(j => (
                    <Jokecard
                        votes={j.votes}
                        jokeTxt={j.text}
                        key={j.id}
                        upVote={() => this.handleVote(j.id, 1)}
                        downVote={() => this.handleVote(j.id, -1)}
                    />
                ))}
            </div>;
        if (this.state.isLoading) {
            return <div>{loadingPage}</div>
        }
        return (
            <div className='Generate-JokesUI'>
                <div className='Generate-sideBar'>
                    <h1 className='Generate-title'><span>Dad</span> Jokes</h1>
                    <div>
                        <img />
                    </div>
                    <button
                        onClick={this.fetchJokes}
                    >New Jokes</button>
                </div>
                <div className='Generate-Displayjokes'>
                    {jokeDisplay}
                </div>

            </div>
        )
    }
}
