// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: votes.sql

package database

import (
	"context"
)

const createPostVote = `-- name: CreatePostVote :one
INSERT INTO votes (post_id, user_id, type)
VALUES ($1, $2, $3)
RETURNING id, post_id, user_id, type, created_at, updated_at
`

type CreatePostVoteParams struct {
	PostID int32    `db:"post_id" json:"postId"`
	UserID int32    `db:"user_id" json:"userId"`
	Type   VoteType `db:"type" json:"type"`
}

func (q *Queries) CreatePostVote(ctx context.Context, arg CreatePostVoteParams) (Vote, error) {
	row := q.db.QueryRowContext(ctx, createPostVote, arg.PostID, arg.UserID, arg.Type)
	var i Vote
	err := row.Scan(
		&i.ID,
		&i.PostID,
		&i.UserID,
		&i.Type,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const findUserVoteOfAPost = `-- name: FindUserVoteOfAPost :one
SELECT id, post_id, user_id, type, created_at, updated_at FROM votes WHERE post_id = $1 AND user_id = $2
`

type FindUserVoteOfAPostParams struct {
	PostID int32 `db:"post_id" json:"postId"`
	UserID int32 `db:"user_id" json:"userId"`
}

func (q *Queries) FindUserVoteOfAPost(ctx context.Context, arg FindUserVoteOfAPostParams) (Vote, error) {
	row := q.db.QueryRowContext(ctx, findUserVoteOfAPost, arg.PostID, arg.UserID)
	var i Vote
	err := row.Scan(
		&i.ID,
		&i.PostID,
		&i.UserID,
		&i.Type,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const removePostVote = `-- name: RemovePostVote :exec
DELETE FROM votes WHERE id = $1
`

func (q *Queries) RemovePostVote(ctx context.Context, id int32) error {
	_, err := q.db.ExecContext(ctx, removePostVote, id)
	return err
}

const updatePostVote = `-- name: UpdatePostVote :exec
UPDATE votes SET type = $1 WHERE id = $2
`

type UpdatePostVoteParams struct {
	Type VoteType `db:"type" json:"type"`
	ID   int32    `db:"id" json:"id"`
}

func (q *Queries) UpdatePostVote(ctx context.Context, arg UpdatePostVoteParams) error {
	_, err := q.db.ExecContext(ctx, updatePostVote, arg.Type, arg.ID)
	return err
}
