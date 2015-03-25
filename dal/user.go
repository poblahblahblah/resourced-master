package dal

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/resourced/resourced-master/libstring"
	"golang.org/x/crypto/bcrypt"
)

func NewUser(db *sqlx.DB) *User {
	user := &User{}
	user.db = db
	user.table = "users"

	return user
}

type UserRow struct {
	ID            int64          `db:"id"`
	ApplicationID sql.NullInt64  `db:"application_id"`
	Kind          string         `db:"kind"`
	Email         sql.NullString `db:"email"`
	Password      sql.NullString `db:"password"`
	Token         sql.NullString `db:"token"`
	Level         string         `db:"level"`
}

type User struct {
	Base
}

func (u *User) userRowFromSqlResult(tx *sqlx.Tx, sqlResult sql.Result) (*UserRow, error) {
	userId, err := sqlResult.LastInsertId()
	if err != nil {
		return nil, err
	}

	return u.GetById(tx, userId)
}

// AllUsers returns all user rows.
func (u *User) AllUsers(tx *sqlx.Tx) ([]*UserRow, error) {
	users := []*UserRow{}
	query := fmt.Sprintf("SELECT * FROM %v", u.table)
	err := u.db.Select(&users, query)

	return users, err
}

// GetById returns record by id.
func (u *User) GetById(tx *sqlx.Tx, id int64) (*UserRow, error) {
	user := &UserRow{}
	query := fmt.Sprintf("SELECT * FROM %v WHERE id=$1", u.table)
	err := u.db.Get(user, query, id)

	return user, err
}

// Signup create a new record of user.
func (u *User) Signup(tx *sqlx.Tx, email, password string) (*UserRow, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 5)
	if err != nil {
		return nil, err
	}

	accessToken, err := libstring.GeneratePassword(32)
	if err != nil {
		return nil, err
	}

	data := make(map[string]interface{})
	data["email"] = email
	data["password"] = hashedPassword
	data["token"] = accessToken
	data["kind"] = "human"
	data["level"] = "basic"

	sqlResult, err := u.InsertIntoTable(tx, data)
	if err != nil {
		return nil, err
	}

	return u.userRowFromSqlResult(tx, sqlResult)
}

func (u *User) CreateAccessToken(tx *sqlx.Tx, appId int64) (*UserRow, error) {
	accessToken, err := libstring.GeneratePassword(32)
	if err != nil {
		return nil, err
	}

	data := make(map[string]interface{})
	data["token"] = accessToken
	data["kind"] = "token"
	data["level"] = "basic"

	sqlResult, err := u.InsertIntoTable(tx, data)
	if err != nil {
		return nil, err
	}

	return u.userRowFromSqlResult(tx, sqlResult)
}

// CreateApplication create a new application for a user.
func (u *User) CreateApplication(tx *sqlx.Tx, userId int64, appName string) (*UserRow, error) {
	app := NewApplication(u.db)
	appRow, err := app.CreateApplication(tx, appName)
	if err != nil {
		return nil, err
	}
	if appRow.ID <= 0 {
		return nil, errors.New("Application ID cannot be empty.")
	}

	data := make(map[string]interface{})
	data["application_id"] = appRow.ID

	_, err = u.UpdateById(tx, data, userId)
	if err != nil {
		return nil, err
	}

	return u.GetById(tx, userId)
}