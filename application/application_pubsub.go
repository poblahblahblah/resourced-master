package application

import (
	"fmt"

	"github.com/lib/pq"

	"github.com/resourced/resourced-master/config"
)

// NewPGListener creates a new database connection for the purpose of listening events.
func (app *Application) NewPGListener(generalConfig config.GeneralConfig) (*pq.ListenerConn, <-chan *pq.Notification, error) {
	notificationChan := make(chan *pq.Notification)

	listener, err := pq.NewListenerConn(generalConfig.DSN, notificationChan)

	return listener, notificationChan, err
}

// ListenAllPGChannels listens to all predefined channels.
func (app *Application) ListenAllPGChannels(listener *pq.ListenerConn) (bool, error) {
	ok, err := listener.Listen("peers_add")
	if err != nil {
		return ok, err
	}

	ok, err = listener.Listen("peers_remove")
	if err != nil {
		return ok, err
	}

	ok, err = listener.Listen("checks_refetch")
	if err != nil {
		return ok, err
	}

	return ok, err
}

// HandlePGNotificationPeersAdd responds to peers_add channel.
func (app *Application) HandlePGNotificationPeersAdd(notification *pq.Notification) error {
	if notification.Channel == "peers_add" {
		hostAndPort := notification.Extra
		app.Peers.Set(hostAndPort, hostAndPort)
	}

	return nil
}

// HandlePGNotificationPeersRemove responds to peers_remove channel.
func (app *Application) HandlePGNotificationPeersRemove(notification *pq.Notification) error {
	if notification.Channel == "peers_remove" {
		hostAndPort := notification.Extra
		app.Peers.Delete(hostAndPort)
	}

	return nil
}

// PGNotifyPeersAdd sends message to peers_add channel.
func (app *Application) PGNotifyPeersAdd() error {
	_, err := app.DBConfig.Core.Exec(fmt.Sprintf("NOTIFY peers_add, '%v'", app.FullAddr()))
	return err
}

// PGNotifyPeersRemove sends message to peers_remove channel.
func (app *Application) PGNotifyPeersRemove() error {
	_, err := app.DBConfig.Core.Exec(fmt.Sprintf("NOTIFY peers_remove, '%v'", app.FullAddr()))
	return err
}

// PGNotifyChecksRefetch sends message to checks_refetch channel.
func (app *Application) PGNotifyChecksRefetch() error {
	_, err := app.DBConfig.Core.Exec("NOTIFY checks_refetch")
	return err
}