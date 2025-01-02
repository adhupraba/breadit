// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: posts.sql

package database

import (
	"context"
	"encoding/json"

	"github.com/adhupraba/breadit-server/internal/db_types"
	"github.com/lib/pq"
)

const createPost = `-- name: CreatePost :one
INSERT INTO posts (title, content, subreddit_id, author_id)
VALUES ($1, $2, $3, $4)
RETURNING id, title, content, subreddit_id, author_id, created_at, updated_at
`

type CreatePostParams struct {
	Title       string                  `db:"title" json:"title"`
	Content     db_types.NullRawMessage `db:"content" json:"content"`
	SubredditID int32                   `db:"subreddit_id" json:"subredditId"`
	AuthorID    int32                   `db:"author_id" json:"authorId"`
}

func (q *Queries) CreatePost(ctx context.Context, arg CreatePostParams) (Post, error) {
	row := q.db.QueryRowContext(ctx, createPost,
		arg.Title,
		arg.Content,
		arg.SubredditID,
		arg.AuthorID,
	)
	var i Post
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Content,
		&i.SubredditID,
		&i.AuthorID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const findPostWithAuthorAndVotes = `-- name: FindPostWithAuthorAndVotes :one
SELECT
  posts.id, posts.title, posts.content, posts.subreddit_id, posts.author_id, posts.created_at, posts.updated_at,
  users.id, users.name, users.email, users.username, users.password, users.image, users.created_at, users.updated_at,
  JSON_AGG(votes.*) AS votes
FROM posts
  INNER JOIN users ON users.id = posts.author_id
  LEFT JOIN votes ON votes.post_id = posts.id
WHERE posts.id = $1
GROUP BY posts.id, users.id
`

type FindPostWithAuthorAndVotesRow struct {
	Post  Post            `db:"post" json:"post"`
	User  User            `db:"user" json:"user"`
	Votes json.RawMessage `db:"votes" json:"votes"`
}

func (q *Queries) FindPostWithAuthorAndVotes(ctx context.Context, id int32) (FindPostWithAuthorAndVotesRow, error) {
	row := q.db.QueryRowContext(ctx, findPostWithAuthorAndVotes, id)
	var i FindPostWithAuthorAndVotesRow
	err := row.Scan(
		&i.Post.ID,
		&i.Post.Title,
		&i.Post.Content,
		&i.Post.SubredditID,
		&i.Post.AuthorID,
		&i.Post.CreatedAt,
		&i.Post.UpdatedAt,
		&i.User.ID,
		&i.User.Name,
		&i.User.Email,
		&i.User.Username,
		&i.User.Password,
		&i.User.Image,
		&i.User.CreatedAt,
		&i.User.UpdatedAt,
		&i.Votes,
	)
	return i, err
}

const findPostsOfSubreddit = `-- name: FindPostsOfSubreddit :many
WITH vars (subreddit_name, is_authenticated, subreddit_ids, subreddit_id) AS (
	VALUES (
    $3::TEXT,
    $4::BOOL,
    $5::INT[],
    $6::INT
  )
)
SELECT
  posts.id, posts.title, posts.content, posts.subreddit_id, posts.author_id, posts.created_at, posts.updated_at,
  users.id, users.name, users.email, users.username, users.password, users.image, users.created_at, users.updated_at,
  subreddits.id, subreddits.name, subreddits.creator_id, subreddits.created_at, subreddits.updated_at,
  TO_JSON(ARRAY_AGG(DISTINCT votes.*)) AS votes,
  TO_JSON(ARRAY_AGG(DISTINCT comments.*)) AS comments
FROM posts
  INNER JOIN users ON users.id = posts.author_id
  INNER JOIN subreddits ON subreddits.id = posts.subreddit_id
  LEFT JOIN votes ON votes.post_id = posts.id
  -- take top level comments only
  LEFT JOIN comments ON comments.post_id = posts.id AND comments.reply_to_id IS NULL,
  vars
WHERE (
  CASE
    WHEN
      vars.subreddit_name IS NOT NULL AND
      LENGTH(vars.subreddit_name) > 0
        THEN subreddits.name = vars.subreddit_name
    WHEN 
      vars.is_authenticated AND
      ARRAY_LENGTH(vars.subreddit_ids, 1) > 0
        THEN subreddits.id = ANY(vars.subreddit_ids)
    WHEN
      vars.subreddit_id IS NOT NULL AND
      vars.subreddit_id > 0
        THEN posts.subreddit_id = vars.subreddit_id
 		ELSE TRUE
  END
)
GROUP BY posts.id, users.id, subreddits.id
ORDER BY posts.created_at DESC, posts.id DESC
OFFSET $1 LIMIT $2
`

type FindPostsOfSubredditParams struct {
	Offset          int32   `db:"offset" json:"offset"`
	Limit           int32   `db:"limit" json:"limit"`
	SubredditName   string  `db:"subreddit_name" json:"subredditName"`
	IsAuthenticated bool    `db:"is_authenticated" json:"isAuthenticated"`
	SubredditIds    []int32 `db:"subreddit_ids" json:"subredditIds"`
	SubredditID     int32   `db:"subreddit_id" json:"subredditId"`
}

type FindPostsOfSubredditRow struct {
	Post      Post            `db:"post" json:"post"`
	User      User            `db:"user" json:"user"`
	Subreddit Subreddit       `db:"subreddit" json:"subreddit"`
	Votes     json.RawMessage `db:"votes" json:"votes"`
	Comments  json.RawMessage `db:"comments" json:"comments"`
}

func (q *Queries) FindPostsOfSubreddit(ctx context.Context, arg FindPostsOfSubredditParams) ([]FindPostsOfSubredditRow, error) {
	rows, err := q.db.QueryContext(ctx, findPostsOfSubreddit,
		arg.Offset,
		arg.Limit,
		arg.SubredditName,
		arg.IsAuthenticated,
		pq.Array(arg.SubredditIds),
		arg.SubredditID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []FindPostsOfSubredditRow
	for rows.Next() {
		var i FindPostsOfSubredditRow
		if err := rows.Scan(
			&i.Post.ID,
			&i.Post.Title,
			&i.Post.Content,
			&i.Post.SubredditID,
			&i.Post.AuthorID,
			&i.Post.CreatedAt,
			&i.Post.UpdatedAt,
			&i.User.ID,
			&i.User.Name,
			&i.User.Email,
			&i.User.Username,
			&i.User.Password,
			&i.User.Image,
			&i.User.CreatedAt,
			&i.User.UpdatedAt,
			&i.Subreddit.ID,
			&i.Subreddit.Name,
			&i.Subreddit.CreatorID,
			&i.Subreddit.CreatedAt,
			&i.Subreddit.UpdatedAt,
			&i.Votes,
			&i.Comments,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
